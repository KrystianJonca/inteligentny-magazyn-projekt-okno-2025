import { MoreHorizontal } from 'lucide-react';

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
  onView?: (warehouse: WarehouseRead) => void; // Optional: To view details, perhaps in a modal or separate page
  onEdit: (warehouse: WarehouseRead) => void;
  onDelete: (warehouseId: number) => void;
}

export function WarehouseTable({ warehouses, onView, onEdit, onDelete }: WarehouseTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No warehouses found.
              </TableCell>
            </TableRow>
          ) : (
            warehouses.map(warehouse => (
              <TableRow key={warehouse.warehouse_id}>
                <TableCell className="font-medium">{warehouse.name}</TableCell>
                <TableCell>{warehouse.address}</TableCell>
                <TableCell>{warehouse.manager_name}</TableCell>
                <TableCell>{warehouse.phone}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(warehouse)}>
                          View Details
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEdit(warehouse)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(warehouse.warehouse_id)}
                        className="text-red-600 hover:!text-red-600 hover:!bg-red-50"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
