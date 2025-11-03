#![cfg(test)]

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
    // Suppress unused variable warning for rental2_id
    assert!(client.get_rental(&rental2_id).is_some());
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
    // Suppress unused variable warning
    assert!(client.get_rental(&rental1).is_some());
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
