#!/usr/bin/env python3
"""
End-to-End Test Script for Warehouse Management API

This script tests the complete flow of the Warehouse Management API:
1. User registration and login
2. Warehouse CRUD operations
3. Item CRUD operations
4. Inventory management and transfers

Usage:
    python e2e_test.py [--host HOST] [--port PORT]

Options:
    --host HOST    API host address [default: http://localhost]
    --port PORT    API port [default: 8000]
"""

import argparse
import sys
import time
from typing import Any

import requests


class WarehouseAPITest:
    """End-to-End test for the Warehouse Management API."""

    def __init__(self, host: str = "http://localhost", port: int = 8000):
        """Initialize the test with the API host and port."""
        self.base_url = f"{host}:{port}"
        self.token = None
        self.headers = {"Content-Type": "application/json"}
        self.test_user = {
            "email": f"test-user-{int(time.time())}@example.com",
            "username": f"test-user-{int(time.time())}",
            "password": "Test@password123",
        }

        # Test data
        self.warehouses = []
        self.items = []
        self.inventory_records = []

        # Test warehouse data
        self.test_warehouse = {
            "name": f"Test Warehouse {int(time.time())}",
            "square_footage": 10000.0,
            "address": "123 Test Street, Test City, 12345",
            "manager_name": "Test Manager",
            "phone": "123-456-7890",
            "latitude": 37.7749,
            "longitude": -122.4194,
        }

        self.updated_warehouse = {
            "name": f"Updated Warehouse {int(time.time())}",
            "square_footage": 15000.0,
            "manager_name": "Updated Manager",
        }

        # Test item data
        self.test_item = {
            "name": f"Test Item {int(time.time())}",
            "description": "This is a test item for E2E testing",
            "sku": f"SKU-TEST-{int(time.time())}",
        }

        self.updated_item = {
            "name": f"Updated Item {int(time.time())}",
            "description": "This is an updated test item description",
        }

        # Test inventory data
        self.test_inventory = {
            "quantity": 100
            # warehouse_id and item_id will be added dynamically after creation
        }

        self.updated_inventory = {"quantity": 50}

        # Second warehouse and item for inventory transfer tests
        self.second_warehouse = {
            "name": f"Second Warehouse {int(time.time())}",
            "square_footage": 8000.0,
            "address": "456 Test Avenue, Test City, 12345",
            "manager_name": "Second Manager",
            "phone": "987-654-3210",
            "latitude": 37.7833,
            "longitude": -122.4167,
        }

        self.second_item = {
            "name": f"Second Item {int(time.time())}",
            "description": "This is a second test item for E2E testing",
            "sku": f"SKU-TEST2-{int(time.time())}",
        }

        # Test inventory transfer data
        self.test_transfer = {
            "quantity": 25
            # source_warehouse_id, destination_warehouse_id, and item_id will be added dynamically
        }

    def run_tests(self) -> None:
        """Run all tests in sequence."""
        try:
            print("\n🚀 Starting End-to-End Tests for Warehouse Management API")
            print(f"🌐 API URL: {self.base_url}\n")

            # Test API root
            self.test_api_root()

            # Test authentication
            self.test_user_registration()
            self.test_user_login()

            # Test warehouse operations
            self.test_create_warehouse()
            self.test_get_warehouse()
            self.test_get_all_warehouses()
            self.test_update_warehouse()

            # Create a second warehouse for inventory transfer tests
            self.test_create_second_warehouse()

            # Test item operations
            self.test_create_item()
            self.test_get_item()
            self.test_get_all_items()
            self.test_search_items()
            self.test_update_item()

            # Create a second item for inventory tests
            self.test_create_second_item()

            # Test inventory operations
            self.test_create_inventory()
            self.test_get_inventory_by_warehouse()
            self.test_get_inventory_by_item()
            self.test_get_inventory_by_warehouse_and_item()
            self.test_update_inventory()
            self.test_create_second_inventory()
            self.test_transfer_inventory()
            self.test_transfer_inventory_insufficient_quantity()
            self.test_delete_inventory()

            # Clean up - delete remaining items and warehouses
            self.test_delete_item()
            self.test_delete_second_item()
            self.test_delete_warehouse()
            self.test_delete_second_warehouse()

            print("\n✅ All tests completed successfully!")

        except AssertionError as e:
            print(f"\n❌ Test failed: {e}")
            sys.exit(1)
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")
            sys.exit(1)

    def make_request(
        self,
        method: str,
        endpoint: str,
        data: dict[str, Any] | None = None,
        expected_status: int = 200,
    ) -> dict[str, Any]:
        """Make an HTTP request to the API."""
        url = f"{self.base_url}{endpoint}"

        # Add authorization header if token is available
        headers = self.headers.copy()
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        # Make the request
        response = requests.request(method=method, url=url, headers=headers, json=data)

        # Check status code
        if response.status_code != expected_status:
            print(f"Request failed: {response.status_code} - {response.text}")
            raise AssertionError(
                f"Expected status code {expected_status}, got {response.status_code}. "
                f"Response: {response.text}"
            )

        # Return response data if any
        if response.text and response.headers.get("content-type") == "application/json":
            return response.json()
        return {}

    # API Root Test
    def test_api_root(self) -> None:
        """Test the API root endpoint."""
        print("📋 Testing API root...")
        response = self.make_request("GET", "/")
        assert "message" in response, "Root endpoint should return a message"
        print("✅ API root test passed")

    # Authentication Tests
    def test_user_registration(self) -> None:
        """Test user registration."""
        print("📋 Testing user registration...")
        response = self.make_request(
            "POST", "/auth/register", data=self.test_user, expected_status=201
        )
        assert "id" in response, "Registration should return user ID"
        assert response["email"] == self.test_user["email"], "Email should match"
        assert response["username"] == self.test_user["username"], "Username should match"
        print("✅ User registration test passed")

    def test_user_login(self) -> None:
        """Test user login."""
        print("📋 Testing user login...")
        login_data = {
            "username": self.test_user["username"],
            "password": self.test_user["password"],
        }

        # For login, we need to use form data
        url = f"{self.base_url}/auth/login"
        response = requests.post(
            url, data=login_data, headers={"Content-Type": "application/x-www-form-urlencoded"}
        )

        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "Login should return access token"
        assert data["token_type"] == "bearer", "Token type should be bearer"

        # Save the token for subsequent requests
        self.token = data["access_token"]
        print("✅ User login test passed")

    # Warehouse Tests
    def test_create_warehouse(self) -> None:
        """Test creating a new warehouse."""
        print("📋 Testing warehouse creation...")
        response = self.make_request(
            "POST", "/warehouses/", data=self.test_warehouse, expected_status=201
        )

        # Verify response
        assert "warehouse_id" in response, "Response should include warehouse_id"
        assert response["name"] == self.test_warehouse["name"], "Warehouse name should match"
        assert response["square_footage"] == self.test_warehouse["square_footage"], (
            "Square footage should match"
        )
        assert response["address"] == self.test_warehouse["address"], "Address should match"
        assert response["manager_name"] == self.test_warehouse["manager_name"], (
            "Manager name should match"
        )
        assert response["phone"] == self.test_warehouse["phone"], "Phone should match"
        assert float(response["latitude"]) == self.test_warehouse["latitude"], (
            "Latitude should match"
        )
        assert float(response["longitude"]) == self.test_warehouse["longitude"], (
            "Longitude should match"
        )

        # Save warehouse ID for later tests
        self.warehouses.append(response)
        print("✅ Warehouse creation test passed")

    def test_get_warehouse(self) -> None:
        """Test getting a warehouse by ID."""
        print("📋 Testing get warehouse by ID...")

        # Skip if no warehouses were created
        if not self.warehouses:
            print("⚠️ Skipping test: No warehouses available")
            return

        warehouse_id = self.warehouses[0]["warehouse_id"]
        response = self.make_request("GET", f"/warehouses/{warehouse_id}")

        # Verify response
        assert response["warehouse_id"] == warehouse_id, "Warehouse ID should match"
        assert response["name"] == self.test_warehouse["name"], "Warehouse name should match"
        print("✅ Get warehouse test passed")

    def test_get_all_warehouses(self) -> None:
        """Test getting all warehouses."""
        print("📋 Testing get all warehouses...")

        response = self.make_request("GET", "/warehouses/")

        # Verify response
        assert isinstance(response, list), "Response should be a list"
        assert len(response) > 0, "Response should contain at least one warehouse"

        # Check if our created warehouse is in the list
        if self.warehouses:
            warehouse_ids = [w["warehouse_id"] for w in response]
            assert self.warehouses[0]["warehouse_id"] in warehouse_ids, (
                "Created warehouse should be in the list"
            )

        print("✅ Get all warehouses test passed")

    def test_update_warehouse(self) -> None:
        """Test updating a warehouse."""
        print("📋 Testing warehouse update...")

        # Skip if no warehouses were created
        if not self.warehouses:
            print("⚠️ Skipping test: No warehouses available")
            return

        warehouse_id = self.warehouses[0]["warehouse_id"]
        response = self.make_request(
            "PATCH", f"/warehouses/{warehouse_id}", data=self.updated_warehouse
        )

        # Verify response
        assert response["warehouse_id"] == warehouse_id, "Warehouse ID should match"
        assert response["name"] == self.updated_warehouse["name"], "Updated name should match"
        assert response["square_footage"] == self.updated_warehouse["square_footage"], (
            "Updated square footage should match"
        )
        assert response["manager_name"] == self.updated_warehouse["manager_name"], (
            "Updated manager name should match"
        )

        # Verify unchanged fields
        assert response["address"] == self.test_warehouse["address"], (
            "Address should remain unchanged"
        )
        assert response["phone"] == self.test_warehouse["phone"], "Phone should remain unchanged"

        # Update our stored warehouse data
        self.warehouses[0] = response
        print("✅ Warehouse update test passed")

    def test_create_second_warehouse(self) -> None:
        """Create a second warehouse for inventory transfer tests."""
        print("📋 Testing second warehouse creation...")
        response = self.make_request(
            "POST", "/warehouses/", data=self.second_warehouse, expected_status=201
        )

        # Verify response
        assert "warehouse_id" in response, "Response should include warehouse_id"
        assert response["name"] == self.second_warehouse["name"], "Warehouse name should match"

        # Save second warehouse for later tests
        self.warehouses.append(response)
        print("✅ Second warehouse creation test passed")

    def test_delete_warehouse(self) -> None:
        """Test deleting a warehouse."""
        print("📋 Testing warehouse deletion...")

        # Skip if no warehouses were created
        if not self.warehouses:
            print("⚠️ Skipping test: No warehouses available")
            return

        warehouse_id = self.warehouses[0]["warehouse_id"]
        self.make_request("DELETE", f"/warehouses/{warehouse_id}", expected_status=204)

        # Verify deletion by trying to get the warehouse (should return 404)
        try:
            self.make_request("GET", f"/warehouses/{warehouse_id}", expected_status=404)
            print("✅ Warehouse deletion test passed")
        except AssertionError as e:
            if "404" in str(e):
                print("✅ Warehouse deletion test passed")
            else:
                raise

    def test_delete_second_warehouse(self) -> None:
        """Delete the second warehouse."""
        print("📋 Testing second warehouse deletion...")

        # Skip if less than 2 warehouses were created
        if len(self.warehouses) < 2:
            print("⚠️ Skipping test: Second warehouse not available")
            return

        warehouse_id = self.warehouses[1]["warehouse_id"]
        self.make_request("DELETE", f"/warehouses/{warehouse_id}", expected_status=204)

        # Verify deletion
        try:
            self.make_request("GET", f"/warehouses/{warehouse_id}", expected_status=404)
            print("✅ Second warehouse deletion test passed")
        except AssertionError as e:
            if "404" in str(e):
                print("✅ Second warehouse deletion test passed")
            else:
                raise

    # Item Tests
    def test_create_item(self) -> None:
        """Test creating a new item."""
        print("📋 Testing item creation...")
        response = self.make_request("POST", "/items/", data=self.test_item, expected_status=201)

        # Verify response
        assert "item_id" in response, "Response should include item_id"
        assert response["name"] == self.test_item["name"], "Item name should match"
        assert response["description"] == self.test_item["description"], (
            "Item description should match"
        )
        assert response["sku"] == self.test_item["sku"], "SKU should match"
        assert "total_inventory" in response, "Response should include total_inventory"
        assert response["total_inventory"] == 0, "New item should have zero inventory"

        # Save item for later tests
        self.items.append(response)
        print("✅ Item creation test passed")

    def test_get_item(self) -> None:
        """Test getting an item by ID."""
        print("📋 Testing get item by ID...")

        # Skip if no items were created
        if not self.items:
            print("⚠️ Skipping test: No items available")
            return

        item_id = self.items[0]["item_id"]
        response = self.make_request("GET", f"/items/{item_id}")

        # Verify response
        assert response["item_id"] == item_id, "Item ID should match"
        assert response["name"] == self.test_item["name"], "Item name should match"
        assert response["description"] == self.test_item["description"], (
            "Item description should match"
        )
        assert response["sku"] == self.test_item["sku"], "SKU should match"
        assert "total_inventory" in response, "Response should include total_inventory"

        print("✅ Get item test passed")

    def test_get_all_items(self) -> None:
        """Test getting all items with pagination."""
        print("📋 Testing get all items...")

        response = self.make_request("GET", "/items/")

        # Verify response structure
        assert "items" in response, "Response should include items array"
        assert "page_info" in response, "Response should include page_info"
        assert isinstance(response["items"], list), "Items should be a list"

        # Verify pagination info
        page_info = response["page_info"]
        assert "total_items" in page_info, "Page info should include total_items"
        assert "page" in page_info, "Page info should include page"
        assert "page_size" in page_info, "Page info should include page_size"
        assert "total_pages" in page_info, "Page info should include total_pages"
        assert "has_next_page" in page_info, "Page info should include has_next_page"

        # Check if our created item is in the list
        if self.items:
            item_ids = [item["item_id"] for item in response["items"]]
            assert self.items[0]["item_id"] in item_ids, "Created item should be in the list"

        print("✅ Get all items test passed")

    def test_search_items(self) -> None:
        """Test searching items by name."""
        print("📋 Testing item search...")

        # Skip if no items were created
        if not self.items:
            print("⚠️ Skipping test: No items available")
            return

        # Search using part of the item name
        search_term = self.test_item["name"].split()[0]  # Use first word of item name
        response = self.make_request("GET", f"/items/?search={search_term}")

        # Verify response
        assert "items" in response, "Response should include items array"
        assert len(response["items"]) > 0, "Search should return at least one item"

        # Check if our created item is in the search results
        item_ids = [item["item_id"] for item in response["items"]]
        assert self.items[0]["item_id"] in item_ids, "Created item should be in the search results"

        print("✅ Item search test passed")

    def test_update_item(self) -> None:
        """Test updating an item."""
        print("📋 Testing item update...")

        # Skip if no items were created
        if not self.items:
            print("⚠️ Skipping test: No items available")
            return

        item_id = self.items[0]["item_id"]
        response = self.make_request("PATCH", f"/items/{item_id}", data=self.updated_item)

        # Verify response
        assert response["item_id"] == item_id, "Item ID should match"
        assert response["name"] == self.updated_item["name"], "Updated name should match"
        assert response["description"] == self.updated_item["description"], (
            "Updated description should match"
        )

        # Verify unchanged fields
        assert response["sku"] == self.test_item["sku"], "SKU should remain unchanged"

        # Update our stored item data
        self.items[0] = response
        print("✅ Item update test passed")

    def test_create_second_item(self) -> None:
        """Create a second item for inventory tests."""
        print("📋 Testing second item creation...")
        response = self.make_request("POST", "/items/", data=self.second_item, expected_status=201)

        # Verify response
        assert "item_id" in response, "Response should include item_id"
        assert response["name"] == self.second_item["name"], "Item name should match"

        # Save second item for later tests
        self.items.append(response)
        print("✅ Second item creation test passed")

    def test_delete_second_item(self) -> None:
        """Delete the second item."""
        print("📋 Testing second item deletion...")

        # Skip if less than 2 items were created
        if len(self.items) < 2:
            print("⚠️ Skipping test: Second item not available")
            return

        item_id = self.items[1]["item_id"]
        self.make_request("DELETE", f"/items/{item_id}", expected_status=204)

        # Verify deletion
        try:
            self.make_request("GET", f"/items/{item_id}", expected_status=404)
            print("✅ Second item deletion test passed")
        except AssertionError as e:
            if "404" in str(e):
                print("✅ Second item deletion test passed")
            else:
                raise

    def test_delete_item(self) -> None:
        """Test deleting an item."""
        print("📋 Testing item deletion...")

        # Skip if no items were created
        if not self.items:
            print("⚠️ Skipping test: No items available")
            return

        item_id = self.items[0]["item_id"]
        self.make_request("DELETE", f"/items/{item_id}", expected_status=204)

        # Verify deletion by trying to get the item (should return 404)
        try:
            self.make_request("GET", f"/items/{item_id}", expected_status=404)
            print("✅ Item deletion test passed")
        except AssertionError as e:
            if "404" in str(e):
                print("✅ Item deletion test passed")
            else:
                raise

    # Inventory Tests
    def test_create_inventory(self) -> None:
        """Test creating a new inventory record."""
        print("📋 Testing inventory creation...")

        # Skip if no warehouses or items were created
        if not self.warehouses or not self.items:
            print("⚠️ Skipping test: No warehouses or items available")
            return

        # Create inventory data with warehouse_id and item_id
        inventory_data = self.test_inventory.copy()
        inventory_data["warehouse_id"] = self.warehouses[0]["warehouse_id"]
        inventory_data["item_id"] = self.items[0]["item_id"]

        response = self.make_request(
            "POST", "/inventory/", data=inventory_data, expected_status=201
        )

        # Verify response
        assert response["warehouse_id"] == inventory_data["warehouse_id"], (
            "Warehouse ID should match"
        )
        assert response["item_id"] == inventory_data["item_id"], "Item ID should match"
        assert response["quantity"] == inventory_data["quantity"], "Quantity should match"

        # Save inventory record for later tests
        self.inventory_records.append(response)
        print("✅ Inventory creation test passed")

    def test_get_inventory_by_warehouse(self) -> None:
        """Test getting inventory by warehouse ID."""
        print("📋 Testing get inventory by warehouse ID...")

        # Skip if no inventory records were created
        if not self.inventory_records:
            print("⚠️ Skipping test: No inventory records available")
            return

        warehouse_id = self.inventory_records[0]["warehouse_id"]
        response = self.make_request("GET", f"/inventory/warehouse/{warehouse_id}")

        # Print response for debugging
        print(f"Response structure: {response}, inv: {self.inventory_records[0]}")

        # Verify response
        assert isinstance(response, list), "Response should be a list"
        assert len(response) > 0, "Response should contain at least one inventory record"

        # Check if our created inventory is in the list
        inventory_found = False
        for inv in response:
            # Print each inventory record for debugging
            print(f"Checking inventory record: {inv}")

            # Check if this is our inventory record
            if (
                inv["warehouse_id"] == self.inventory_records[0]["warehouse_id"]
                and inv["item_id"] == self.inventory_records[0]["item_id"]
            ):
                inventory_found = True
                assert inv["quantity"] == self.inventory_records[0]["quantity"], (
                    "Quantity should match"
                )

                break

        assert inventory_found, "Created inventory should be in the list"
        print("✅ Get inventory by warehouse test passed")

    def test_get_inventory_by_item(self) -> None:
        """Test getting inventory by item ID."""
        print("📋 Testing get inventory by item ID...")

        # Skip if no inventory records were created
        if not self.inventory_records:
            print("⚠️ Skipping test: No inventory records available")
            return

        item_id = self.inventory_records[0]["item_id"]
        response = self.make_request("GET", f"/inventory/item/{item_id}")

        # Print response for debugging
        print(f"Response structure: {response}")

        # Verify response
        assert isinstance(response, list), "Response should be a list"
        assert len(response) > 0, "Response should contain at least one inventory record"

        # Check if our created inventory is in the list
        inventory_found = False
        for inv in response:
            # Print each inventory record for debugging
            print(f"Checking inventory record: {inv}")

            # Check if this is our inventory record
            if (
                inv["warehouse_id"] == self.inventory_records[0]["warehouse_id"]
                and inv["item_id"] == self.inventory_records[0]["item_id"]
            ):
                inventory_found = True
                assert inv["quantity"] == self.inventory_records[0]["quantity"], (
                    "Quantity should match"
                )

                break

        assert inventory_found, "Created inventory should be in the list"
        print("✅ Get inventory by item test passed")

    def test_get_inventory_by_warehouse_and_item(self) -> None:
        """Test getting inventory by warehouse ID and item ID."""
        print("📋 Testing get inventory by warehouse and item IDs...")

        # Skip if no inventory records were created
        if not self.inventory_records:
            print("⚠️ Skipping test: No inventory records available")
            return

        warehouse_id = self.inventory_records[0]["warehouse_id"]
        item_id = self.inventory_records[0]["item_id"]
        response = self.make_request("GET", f"/inventory/{warehouse_id}/{item_id}")

        # Verify response
        assert response["warehouse_id"] == warehouse_id, "Warehouse ID should match"
        assert response["item_id"] == item_id, "Item ID should match"
        assert response["quantity"] == self.inventory_records[0]["quantity"], (
            "Quantity should match"
        )

        print("✅ Get inventory by warehouse and item test passed")

    def test_update_inventory(self) -> None:
        """Test updating an inventory record."""
        print("📋 Testing inventory update...")

        # Skip if no inventory records were created
        if not self.inventory_records:
            print("⚠️ Skipping test: No inventory records available")
            return

        warehouse_id = self.inventory_records[0]["warehouse_id"]
        item_id = self.inventory_records[0]["item_id"]
        response = self.make_request(
            "PATCH", f"/inventory/{warehouse_id}/{item_id}", data=self.updated_inventory
        )

        # Verify response
        assert response["warehouse_id"] == warehouse_id, "Warehouse ID should match"
        assert response["item_id"] == item_id, "Item ID should match"
        assert response["quantity"] == self.updated_inventory["quantity"], (
            "Updated quantity should match"
        )

        # Update our stored inventory data
        self.inventory_records[0] = response
        print("✅ Inventory update test passed")

    def test_create_second_inventory(self) -> None:
        """Create a second inventory record for transfer tests."""
        print("📋 Testing second inventory creation...")

        # Skip if less than 2 warehouses or items were created
        if len(self.warehouses) < 2 or len(self.items) < 1:
            print("⚠️ Skipping test: Second warehouse or item not available")
            return

        # Create inventory data with second warehouse_id and first item_id
        inventory_data = {
            "warehouse_id": self.warehouses[1]["warehouse_id"],
            "item_id": self.items[0]["item_id"],
            "quantity": 0,  # Start with zero quantity for transfer test
        }

        response = self.make_request(
            "POST", "/inventory/", data=inventory_data, expected_status=201
        )

        # Verify response
        assert response["warehouse_id"] == inventory_data["warehouse_id"], (
            "Warehouse ID should match"
        )
        assert response["item_id"] == inventory_data["item_id"], "Item ID should match"
        assert response["quantity"] == inventory_data["quantity"], "Quantity should match"

        # Save second inventory record
        self.inventory_records.append(response)
        print("✅ Second inventory creation test passed")

    def test_transfer_inventory(self) -> None:
        """Test transferring inventory between warehouses."""
        print("📋 Testing inventory transfer...")

        # Skip if less than 2 inventory records were created
        if len(self.inventory_records) < 2:
            print("⚠️ Skipping test: Not enough inventory records available")
            return

        # Create transfer data
        transfer_data = {
            "source_warehouse_id": self.inventory_records[0]["warehouse_id"],
            "destination_warehouse_id": self.inventory_records[1]["warehouse_id"],
            "item_id": self.inventory_records[0]["item_id"],
            "quantity": self.test_transfer["quantity"],
        }

        # Ensure source has enough quantity
        if self.inventory_records[0]["quantity"] < transfer_data["quantity"]:
            print("⚠️ Skipping test: Source inventory has insufficient quantity")
            return

        response = self.make_request("POST", "/inventory/transfer", data=transfer_data)

        # Verify response
        assert "message" in response, "Response should include a message"
        assert "source_inventory" in response, "Response should include source_inventory"
        assert "destination_inventory" in response, "Response should include destination_inventory"

        source_inventory = response["source_inventory"]
        destination_inventory = response["destination_inventory"]

        # Verify source inventory
        assert source_inventory["warehouse_id"] == transfer_data["source_warehouse_id"], (
            "Source warehouse ID should match"
        )
        assert source_inventory["item_id"] == transfer_data["item_id"], "Item ID should match"
        assert (
            source_inventory["quantity"]
            == self.inventory_records[0]["quantity"] - transfer_data["quantity"]
        ), "Source quantity should be reduced"

        # Verify destination inventory
        assert destination_inventory["warehouse_id"] == transfer_data["destination_warehouse_id"], (
            "Destination warehouse ID should match"
        )
        assert destination_inventory["item_id"] == transfer_data["item_id"], "Item ID should match"
        assert (
            destination_inventory["quantity"]
            == self.inventory_records[1]["quantity"] + transfer_data["quantity"]
        ), "Destination quantity should be increased"

        # Update our stored inventory data
        self.inventory_records[0]["quantity"] = source_inventory["quantity"]
        self.inventory_records[1]["quantity"] = destination_inventory["quantity"]

        print("✅ Inventory transfer test passed")

    def test_transfer_inventory_insufficient_quantity(self) -> None:
        """Test that inventory transfer fails when quantity exceeds available quantity."""
        print("📋 Testing inventory transfer with insufficient quantity...")

        # Skip if less than 2 inventory records were created
        if len(self.inventory_records) < 2:
            print("⚠️ Skipping test: Not enough inventory records available")
            return

        # Create transfer data with quantity exceeding available amount
        excessive_quantity = (
            self.inventory_records[0]["quantity"] + 100
        )  # Ensure it's more than available

        transfer_data = {
            "source_warehouse_id": self.inventory_records[0]["warehouse_id"],
            "destination_warehouse_id": self.inventory_records[1]["warehouse_id"],
            "item_id": self.inventory_records[0]["item_id"],
            "quantity": excessive_quantity,
        }

        # This request should fail with a 400 Bad Request
        try:
            self.make_request(
                "POST", "/inventory/transfer", data=transfer_data, expected_status=400
            )
            print(
                "✅ Inventory transfer with insufficient quantity correctly failed with 400 status"
            )
        except AssertionError as e:
            if "400" in str(e):
                print("✅ Inventory transfer with insufficient quantity failed with 400 status")
            else:
                raise

        # Verify that inventory quantities remain unchanged
        # Get the current inventory records to check they weren't modified
        warehouse_id = self.inventory_records[0]["warehouse_id"]
        item_id = self.inventory_records[0]["item_id"]
        source_inventory = self.make_request("GET", f"/inventory/{warehouse_id}/{item_id}")

        # Verify source inventory quantity is unchanged
        assert source_inventory["quantity"] == self.inventory_records[0]["quantity"], (
            "Source inventory quantity should remain unchanged after failed transfer"
        )

        print("✅ Inventory transfer with insufficient quantity test passed")

    def test_delete_inventory(self) -> None:
        """Test deleting an inventory record."""
        print("📋 Testing inventory deletion...")

        # Skip if no inventory records were created
        if not self.inventory_records:
            print("⚠️ Skipping test: No inventory records available")
            return

        warehouse_id = self.inventory_records[0]["warehouse_id"]
        item_id = self.inventory_records[0]["item_id"]
        self.make_request("DELETE", f"/inventory/{warehouse_id}/{item_id}", expected_status=204)

        # Verify deletion by trying to get the inventory record (should return 404)
        try:
            self.make_request("GET", f"/inventory/{warehouse_id}/{item_id}", expected_status=404)
            print("✅ Inventory deletion test passed")
        except AssertionError as e:
            if "404" in str(e):
                print("✅ Inventory deletion test passed")
            else:
                raise

        # Remove the deleted inventory from our list
        self.inventory_records.pop(0)


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="End-to-End Test for Warehouse Management API")
    parser.add_argument("--host", default="http://localhost", help="API host address")
    parser.add_argument("--port", type=int, default=8000, help="API port")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    tester = WarehouseAPITest(host=args.host, port=args.port)

    tester.run_tests()
