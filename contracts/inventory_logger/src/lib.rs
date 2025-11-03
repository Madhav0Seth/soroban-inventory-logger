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
mod test;