// Fixture for the inventory-management e2e run: executed with bun before the server starts.
// Contract: see inventory-management-contract.ts (db/inventory.ts).
import { resetInventoryData, seedStock } from "../../../db/inventory";

resetInventoryData();
seedStock("EST-1", 5);
seedStock("EST-2", 9);
seedStock("EST-3", 0);
