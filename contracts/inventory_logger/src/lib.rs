#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

// Data structures
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct InventoryItem {
    pub item_id: u64,
    pub name: String,
    pub description: String,
    pub owner: Address,
    pub is_available: bool,
    pub rental_price_per_day: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RentalRecord {
    pub rental_id: u64,
    pub item_id: u64,
    pub renter: Address,
    pub issue_date: u64,
    pub expected_return_date: u64,
    pub actual_return_date: Option<u64>,
    pub deposit_amount: i128,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    ItemCounter,
    RentalCounter,
    Item(u64),
    Rental(u64),
    ItemRentals(u64),
    UserRentals(Address),
}

#[contract]
pub struct InventoryContract;

#[contractimpl]
impl InventoryContract {
    /// Initialize the contract
    pub fn initialize(env: Env) {
        let item_counter: u64 = 0;
        let rental_counter: u64 = 0;
        env.storage().instance().set(&DataKey::ItemCounter, &item_counter);
        env.storage().instance().set(&DataKey::RentalCounter, &rental_counter);
    }

    /// Add a new inventory item
    pub fn add_item(
        env: Env,
        owner: Address,
        name: String,
        description: String,
        rental_price_per_day: i128,
    ) -> u64 {
        owner.require_auth();

        // Get and increment item counter
        let mut item_counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::ItemCounter)
            .unwrap_or(0);
        item_counter += 1;

        let item = InventoryItem {
            item_id: item_counter,
            name,
            description,
            owner: owner.clone(),
            is_available: true,
            rental_price_per_day,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Item(item_counter), &item);
        env.storage()
            .instance()
            .set(&DataKey::ItemCounter, &item_counter);

        item_counter
    }

    /// Get item details
    pub fn get_item(env: Env, item_id: u64) -> Option<InventoryItem> {
        env.storage().persistent().get(&DataKey::Item(item_id))
    }

    /// Issue/rent an item
    pub fn issue_item(
        env: Env,
        renter: Address,
        item_id: u64,
        rental_days: u64,
        deposit_amount: i128,
    ) -> u64 {
        renter.require_auth();

        // Get item
        let mut item: InventoryItem = env
            .storage()
            .persistent()
            .get(&DataKey::Item(item_id))
            .expect("Item not found");

        // Check if item is available
        if !item.is_available {
            panic!("Item is not available for rent");
        }

        // Get current timestamp
        let current_time = env.ledger().timestamp();

        // Calculate expected return date
        let expected_return_date = current_time + (rental_days * 86400); // 86400 seconds per day

        // Get and increment rental counter
        let mut rental_counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::RentalCounter)
            .unwrap_or(0);
        rental_counter += 1;

        // Create rental record
        let rental = RentalRecord {
            rental_id: rental_counter,
            item_id,
            renter: renter.clone(),
            issue_date: current_time,
            expected_return_date,
            actual_return_date: None,
            deposit_amount,
            is_active: true,
        };

        // Mark item as unavailable
        item.is_available = false;
        env.storage().persistent().set(&DataKey::Item(item_id), &item);

        // Store rental record
        env.storage()
            .persistent()
            .set(&DataKey::Rental(rental_counter), &rental);
        env.storage()
            .instance()
            .set(&DataKey::RentalCounter, &rental_counter);

        // Track rental for item
        let mut item_rentals: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::ItemRentals(item_id))
            .unwrap_or(Vec::new(&env));
        item_rentals.push_back(rental_counter);
        env.storage()
            .persistent()
            .set(&DataKey::ItemRentals(item_id), &item_rentals);

        // Track rental for user
        let mut user_rentals: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::UserRentals(renter.clone()))
            .unwrap_or(Vec::new(&env));
        user_rentals.push_back(rental_counter);
        env.storage()
            .persistent()
            .set(&DataKey::UserRentals(renter), &user_rentals);

        rental_counter
    }

    /// Return an item
    pub fn return_item(env: Env, rental_id: u64, returner: Address) -> bool {
        returner.require_auth();

        // Get rental record
        let mut rental: RentalRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Rental(rental_id))
            .expect("Rental not found");

        // Verify the returner is the renter
        if rental.renter != returner {
            panic!("Only the renter can return the item");
        }

        // Check if rental is active
        if !rental.is_active {
            panic!("Rental is already completed");
        }

        // Get current timestamp
        let current_time = env.ledger().timestamp();

        // Update rental record
        rental.actual_return_date = Some(current_time);
        rental.is_active = false;
        env.storage()
            .persistent()
            .set(&DataKey::Rental(rental_id), &rental);

        // Mark item as available
        let mut item: InventoryItem = env
            .storage()
            .persistent()
            .get(&DataKey::Item(rental.item_id))
            .expect("Item not found");
        item.is_available = true;
        env.storage()
            .persistent()
            .set(&DataKey::Item(rental.item_id), &item);

        true
    }

    /// Get rental details
    pub fn get_rental(env: Env, rental_id: u64) -> Option<RentalRecord> {
        env.storage().persistent().get(&DataKey::Rental(rental_id))
    }

    /// Get all rentals for an item
    pub fn get_item_rentals(env: Env, item_id: u64) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::ItemRentals(item_id))
            .unwrap_or(Vec::new(&env))
    }

    /// Get all rentals for a user
    pub fn get_user_rentals(env: Env, user: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::UserRentals(user))
            .unwrap_or(Vec::new(&env))
    }

    /// Check if item is overdue
    pub fn is_overdue(env: Env, rental_id: u64) -> bool {
        let rental: RentalRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Rental(rental_id))
            .expect("Rental not found");

        if !rental.is_active {
            return false;
        }

        let current_time = env.ledger().timestamp();
        current_time > rental.expected_return_date
    }

    /// Update item availability manually (owner only)
    pub fn update_item_availability(env: Env, item_id: u64, is_available: bool, caller: Address) {
        caller.require_auth();

        let mut item: InventoryItem = env
            .storage()
            .persistent()
            .get(&DataKey::Item(item_id))
            .expect("Item not found");

        // Only owner can update availability
        if item.owner != caller {
            panic!("Only the owner can update item availability");
        }

        item.is_available = is_available;
        env.storage().persistent().set(&DataKey::Item(item_id), &item);
    }

    /// Get total number of items
    pub fn get_item_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::ItemCounter)
            .unwrap_or(0)
    }

    /// Get total number of rentals
    pub fn get_rental_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::RentalCounter)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    #[test]
    fn test_add_and_get_item() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(InventoryContract, ());
        let client = InventoryContractClient::new(&env, &contract_id);

        let owner = Address::generate(&env);
        let name = String::from_str(&env, "Laptop");
        let desc = String::from_str(&env, "MacBook Pro 16");

        client.initialize();
        let item_id = client.add_item(&owner, &name, &desc, &100);

        let item = client.get_item(&item_id).unwrap();
        assert_eq!(item.item_id, item_id);
        assert_eq!(item.is_available, true);
    }

    #[test]
    fn test_rent_and_return() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(InventoryContract, ());
        let client = InventoryContractClient::new(&env, &contract_id);

        let owner = Address::generate(&env);
        let renter = Address::generate(&env);
        let name = String::from_str(&env, "Camera");
        let desc = String::from_str(&env, "Canon EOS R5");

        client.initialize();
        let item_id = client.add_item(&owner, &name, &desc, &50);

        // Rent the item
        let rental_id = client.issue_item(&renter, &item_id, &7, &500);
        
        let item = client.get_item(&item_id).unwrap();
        assert_eq!(item.is_available, false);

        let rental = client.get_rental(&rental_id).unwrap();
        assert_eq!(rental.is_active, true);

        // Return the item
        client.return_item(&rental_id, &renter);

        let item = client.get_item(&item_id).unwrap();
        assert_eq!(item.is_available, true);

        let rental = client.get_rental(&rental_id).unwrap();
        assert_eq!(rental.is_active, false);
    }

    #[test]
    fn test_full_inventory_flow() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(InventoryContract, ());
        let client = InventoryContractClient::new(&env, &contract_id);

        let owner = Address::generate(&env);
        let renter1 = Address::generate(&env);
        let renter2 = Address::generate(&env);

        // Initialize
        client.initialize();

        // Add multiple items
        let laptop_id = client.add_item(
            &owner,
            &String::from_str(&env, "Laptop"),
            &String::from_str(&env, "MacBook Pro 16"),
            &150
        );
        
        let camera_id = client.add_item(
            &owner,
            &String::from_str(&env, "Camera"),
            &String::from_str(&env, "Canon EOS R5"),
            &100
        );
        
        let drone_id = client.add_item(
            &owner,
            &String::from_str(&env, "Drone"),
            &String::from_str(&env, "DJI Mavic 3"),
            &200
        );

        // Verify items added
        assert_eq!(client.get_item_count(), 3);
        
        let laptop = client.get_item(&laptop_id).unwrap();
        assert_eq!(laptop.is_available, true);
        assert_eq!(laptop.rental_price_per_day, 150);

        // Rent items
        let rental1_id = client.issue_item(&renter1, &laptop_id, &7, &1000);
        let rental2_id = client.issue_item(&renter2, &camera_id, &3, &500);

        // Verify rentals
        assert_eq!(client.get_rental_count(), 2);
        
        let laptop_after_rent = client.get_item(&laptop_id).unwrap();
        assert_eq!(laptop_after_rent.is_available, false);
        
        let rental1 = client.get_rental(&rental1_id).unwrap();
        assert_eq!(rental1.is_active, true);
        assert_eq!(rental1.item_id, laptop_id);

        // Check user rentals
        let renter1_rentals = client.get_user_rentals(&renter1);
        assert_eq!(renter1_rentals.len(), 1);

        // Return item
        client.return_item(&rental1_id, &renter1);
        
        let laptop_after_return = client.get_item(&laptop_id).unwrap();
        assert_eq!(laptop_after_return.is_available, true);
        
        let rental1_after = client.get_rental(&rental1_id).unwrap();
        assert_eq!(rental1_after.is_active, false);
        assert!(rental1_after.actual_return_date.is_some());

        // Verify drone still available
        let drone = client.get_item(&drone_id).unwrap();
        assert_eq!(drone.is_available, true);
    }

    #[test]
    fn test_multiple_users() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(InventoryContract, ());
        let client = InventoryContractClient::new(&env, &contract_id);

        client.initialize();

        let owner1 = Address::generate(&env);
        let owner2 = Address::generate(&env);
        let renter1 = Address::generate(&env);
        let renter2 = Address::generate(&env);

        // Different owners add items
        let item1 = client.add_item(&owner1, &String::from_str(&env, "PC"), &String::from_str(&env, "Gaming"), &300);
        let item2 = client.add_item(&owner2, &String::from_str(&env, "DSLR"), &String::from_str(&env, "Sony"), &120);

        // Different renters
        let rental1 = client.issue_item(&renter1, &item1, &10, &3000);
        let rental2 = client.issue_item(&renter2, &item2, &5, &600);

        assert_eq!(client.get_item_count(), 2);
        assert_eq!(client.get_rental_count(), 2);

        // Return one
        client.return_item(&rental2, &renter2);
        
        let item2_status = client.get_item(&item2).unwrap();
        assert_eq!(item2_status.is_available, true);
        
        let item1_status = client.get_item(&item1).unwrap();
        assert_eq!(item1_status.is_available, false);
    }

    #[test]
    #[should_panic(expected = "Item is not available for rent")]
    fn test_rent_unavailable_item() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(InventoryContract, ());
        let client = InventoryContractClient::new(&env, &contract_id);

        client.initialize();

        let owner = Address::generate(&env);
        let renter1 = Address::generate(&env);
        let renter2 = Address::generate(&env);

        let item_id = client.add_item(&owner, &String::from_str(&env, "Item"), &String::from_str(&env, "Test"), &50);
        
        // First rental succeeds
        client.issue_item(&renter1, &item_id, &5, &250);
        
        // Second rental should panic
        client.issue_item(&renter2, &item_id, &3, &150);
    }

    #[test]
    #[should_panic(expected = "Rental is already completed")]
    fn test_return_completed_rental() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(InventoryContract, ());
        let client = InventoryContractClient::new(&env, &contract_id);

        client.initialize();

        let owner = Address::generate(&env);
        let renter = Address::generate(&env);

        let item_id = client.add_item(&owner, &String::from_str(&env, "Item"), &String::from_str(&env, "Test"), &50);
        let rental_id = client.issue_item(&renter, &item_id, &5, &250);
        
        // First return succeeds
        client.return_item(&rental_id, &renter);
        
        // Second return should panic
        client.return_item(&rental_id, &renter);
    }
}