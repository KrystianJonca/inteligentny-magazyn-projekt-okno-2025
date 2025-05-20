import { MoreHorizontal, Pencil, Trash2, PackageSearch } from 'lucide-react';

import type { ItemReadWithInventory } from '@/api/schema.types';
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

interface ItemTableProps {
  items: ItemReadWithInventory[];
  onEdit: (item: ItemReadWithInventory) => void;
  onDelete: (itemId: number) => void;
  onManageStock: (item: ItemReadWithInventory) => void;
}

export function ItemTable({ items, onEdit, onDelete, onManageStock }: ItemTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Total Inventory</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map(item => (
              <TableRow key={item.item_id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.sku || '-'}</TableCell>
                <TableCell className="truncate max-w-xs">{item.description}</TableCell>
                <TableCell className="text-right">{item.total_inventory}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onManageStock(item)}>
                        <PackageSearch className="mr-2 h-4 w-4" />
                        Manage Stock
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(item.item_id)}
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
                No items found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
