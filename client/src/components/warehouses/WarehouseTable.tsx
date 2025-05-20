import { MoreHorizontal, PackageSearch, Pencil, Trash2 } from 'lucide-react';

import type { WarehouseRead } from '@/api/schema.types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface WarehouseTableProps {
  warehouses: WarehouseRead[];
  onEdit: (warehouse: WarehouseRead) => void;
  onDelete: (warehouseId: number) => void;
  onManageInventory: (warehouse: WarehouseRead) => void;
}

export function WarehouseTable({
  warehouses,
  onEdit,
  onDelete,
  onManageInventory,
}: WarehouseTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead className="text-right">Sq. Footage</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.length > 0 ? (
            warehouses.map(warehouse => (
              <TableRow key={warehouse.warehouse_id}>
                <TableCell className="font-medium">{warehouse.name}</TableCell>
                <TableCell>{warehouse.address}</TableCell>
                <TableCell>{warehouse.manager_name}</TableCell>
                <TableCell className="text-right">{warehouse.square_footage} sq ft</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(warehouse)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Warehouse
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onManageInventory(warehouse)}>
                        <PackageSearch className="mr-2 h-4 w-4" />
                        Manage Inventory
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(warehouse.warehouse_id)}
                        className="text-red-600 hover:!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-700/50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No warehouses found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
