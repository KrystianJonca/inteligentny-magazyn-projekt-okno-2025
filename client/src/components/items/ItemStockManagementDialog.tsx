import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { AlertCircle, Loader2, PackagePlus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  createInventory,
  deleteInventory,
  getInventoryByItem,
  updateInventory,
} from '@/api/inventory';
import type {
  InventoryCreate,
  InventoryRead,
  InventoryWithWarehouse,
  ItemReadWithInventory,
  WarehouseRead,
} from '@/api/schema.types';
import { getWarehouses } from '@/api/warehouse';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
// TODO: Add toast notifications

interface ItemStockManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemReadWithInventory;
}

const AddToWarehouseFormSchema = z.object({
  warehouse_id: z.string().min(1, 'Warehouse is required.'), // Will be parsed to number
  quantity: z.coerce.number().min(0, 'Quantity must be 0 or greater.'),
});
type AddToWarehouseFormValues = z.infer<typeof AddToWarehouseFormSchema>;

export function ItemStockManagementDialog({
  isOpen,
  onClose,
  item,
}: ItemStockManagementDialogProps) {
  const queryClient = useQueryClient();
  const [editedQuantities, setEditedQuantities] = useState<{ [warehouseId: number]: string }>({});

  const {
    data: itemInventory,
    isLoading: isLoadingInventory,
    error: errorInventory,
    // refetch: refetchItemInventory, // Kept for potential future use
  } = useQuery<InventoryWithWarehouse[], Error>({
    queryKey: ['inventory', item.item_id],
    queryFn: () => getInventoryByItem(item.item_id),
    enabled: isOpen, // Only fetch when dialog is open
  });

  const {
    data: allWarehouses,
    isLoading: isLoadingWarehouses,
    // error: errorWarehouses, // Will handle error inline
  } = useQuery<WarehouseRead[], Error>({
    queryKey: ['warehouses'],
    queryFn: getWarehouses,
    enabled: isOpen,
  });

  const handleQuantityChange = (warehouseId: number, value: string) => {
    setEditedQuantities(prev => ({ ...prev, [warehouseId]: value }));
  };

  useEffect(() => {
    if (isOpen && itemInventory) {
      const initialQuantities: { [warehouseId: number]: string } = {};
      itemInventory.forEach(inv => {
        initialQuantities[inv.warehouse_id] = String(inv.quantity);
      });
      setEditedQuantities(initialQuantities);
    }
  }, [isOpen, itemInventory]);

  const updateMutation = useMutation<
    InventoryRead,
    Error,
    { warehouseId: number; itemId: number; quantity: number }
  >({
    mutationFn: ({ warehouseId, itemId, quantity }) =>
      updateInventory(warehouseId, itemId, { quantity }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', variables.itemId] });
      queryClient.invalidateQueries({ queryKey: ['items'] }); // To update total_inventory on items page
      // TODO: Add success toast
      console.log(`Quantity updated for warehouse ${variables.warehouseId}`);
    },
    onError: (error, variables) => {
      console.error(`Error updating quantity for warehouse ${variables.warehouseId}:`, error);
      // TODO: Add error toast
      // Revert to original value from fetched data
      setEditedQuantities(prev => ({
        ...prev,
        [variables.warehouseId]: String(
          itemInventory?.find(inv => inv.warehouse_id === variables.warehouseId)?.quantity || '0'
        ),
      }));
    },
  });

  const deleteInventoryMutation = useMutation<void, Error, { warehouseId: number; itemId: number }>(
    {
      mutationFn: ({ warehouseId, itemId }) => deleteInventory(warehouseId, itemId),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['inventory', variables.itemId] });
        queryClient.invalidateQueries({ queryKey: ['items'] });
        // TODO: Add success toast for deletion
        console.log(
          `Item ${variables.itemId} removed from warehouse ${variables.warehouseId} successfully`
        );
      },
      onError: (error, variables) => {
        console.error(
          `Error removing item ${variables.itemId} from warehouse ${variables.warehouseId}:`,
          error
        );
        // TODO: Add error toast for deletion
      },
    }
  );

  const handleSaveQuantity = (warehouseId: number) => {
    const newQuantityStr = editedQuantities[warehouseId];
    const newQuantity = parseInt(newQuantityStr, 10);
    if (isNaN(newQuantity) || newQuantity < 0) {
      // TODO: show validation error locally using a small message near input
      console.error('Invalid quantity');
      setEditedQuantities(prev => ({
        ...prev,
        [warehouseId]: String(
          itemInventory?.find(inv => inv.warehouse_id === warehouseId)?.quantity || '0'
        ),
      }));
      return;
    }
    const originalInv = itemInventory?.find(inv => inv.warehouse_id === warehouseId);
    if (originalInv && originalInv.quantity !== newQuantity) {
      updateMutation.mutate({ warehouseId, itemId: item.item_id, quantity: newQuantity });
    }
  };

  const handleRemoveFromWarehouse = (warehouseId: number) => {
    if (
      window.confirm(
        'Are you sure you want to remove this item from this warehouse? This action cannot be undone.'
      )
    ) {
      deleteInventoryMutation.mutate({ warehouseId, itemId: item.item_id });
    }
  };

  const addToWarehouseForm = useForm<AddToWarehouseFormValues>({
    resolver: zodResolver(AddToWarehouseFormSchema),
    defaultValues: {
      warehouse_id: '',
      quantity: 0,
    },
  });

  const createInventoryMutation = useMutation<InventoryRead, Error, InventoryCreate>({
    mutationFn: createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', item.item_id] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      addToWarehouseForm.reset();
      // TODO: Add success toast
      console.log('Item added to warehouse successfully');
    },
    onError: error => {
      console.error('Error adding item to warehouse:', error);
      // TODO: Add error toast
      if (error.message.includes('already exists')) {
        addToWarehouseForm.setError('warehouse_id', {
          type: 'manual',
          message: 'This item already exists in the selected warehouse.',
        });
      } else if (error.message.includes('not found')) {
        addToWarehouseForm.setError('warehouse_id', {
          type: 'manual',
          message: 'Selected warehouse not found. Please refresh.',
        });
      }
    },
  });

  const handleAddToWarehouseSubmit = (values: AddToWarehouseFormValues) => {
    createInventoryMutation.mutate({
      item_id: item.item_id,
      warehouse_id: parseInt(values.warehouse_id, 10),
      quantity: values.quantity,
    });
  };

  const availableWarehousesForAdding =
    allWarehouses?.filter(w => !itemInventory?.some(inv => inv.warehouse_id === w.warehouse_id)) ||
    [];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Stock for: {item.name}</DialogTitle>
          <DialogDescription>
            Update quantities for this item in existing warehouses or add it to new ones.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Section 1: Current Stock Levels */}
          <div>
            <h3 className="text-lg font-medium mb-2">Current Stock</h3>
            {isLoadingInventory && (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {errorInventory && (
              <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>Error loading stock levels: {errorInventory.message}</span>
              </div>
            )}
            {!isLoadingInventory &&
              !errorInventory &&
              (itemInventory && itemInventory.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Warehouse</TableHead>
                        <TableHead className="w-[120px] text-right">Quantity</TableHead>
                        <TableHead className="w-[100px] text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itemInventory.map(inv => (
                        <TableRow key={inv.warehouse_id}>
                          <TableCell className="font-medium">{inv.warehouse.name}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={editedQuantities[inv.warehouse_id] || '0'}
                              onChange={e => handleQuantityChange(inv.warehouse_id, e.target.value)}
                              className="h-9 w-24 inline-block text-right"
                              min="0"
                            />
                          </TableCell>
                          <TableCell className="text-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveQuantity(inv.warehouse_id)}
                              disabled={
                                (updateMutation.isPending &&
                                  updateMutation.variables?.warehouseId === inv.warehouse_id) ||
                                String(inv.quantity) === editedQuantities[inv.warehouse_id]
                              }
                              title="Save quantity"
                            >
                              {updateMutation.isPending &&
                              updateMutation.variables?.warehouseId === inv.warehouse_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              <span className="sr-only">Save</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFromWarehouse(inv.warehouse_id)}
                              disabled={
                                deleteInventoryMutation.isPending &&
                                deleteInventoryMutation.variables?.warehouseId === inv.warehouse_id
                              }
                              title="Remove from warehouse"
                              className="text-red-600 hover:text-red-700"
                            >
                              {deleteInventoryMutation.isPending &&
                              deleteInventoryMutation.variables?.warehouseId ===
                                inv.warehouse_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span className="sr-only">Remove</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  This item is not currently stocked in any warehouse.
                </p>
              ))}
          </div>

          <Separator />

          {/* Section 2: Add to New Warehouse */}
          <div>
            <h3 className="text-lg font-medium mb-3">Add to New Warehouse</h3>
            {isLoadingWarehouses && (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {/* TODO: Handle errorWarehouses explicitly if needed, e.g. if allWarehouses is undefined and not loading */}
            {!isLoadingWarehouses &&
              allWarehouses &&
              (availableWarehousesForAdding.length > 0 ? (
                <Form {...addToWarehouseForm}>
                  <form
                    onSubmit={addToWarehouseForm.handleSubmit(handleAddToWarehouseSubmit)}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-end"
                  >
                    <FormField
                      control={addToWarehouseForm.control}
                      name="warehouse_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Warehouse</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a warehouse" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableWarehousesForAdding.map(w => (
                                <SelectItem key={w.warehouse_id} value={String(w.warehouse_id)}>
                                  {w.name} (ID: {w.warehouse_id})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addToWarehouseForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              className="w-full sm:w-32"
                              min="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={createInventoryMutation.isPending}
                      className="h-10"
                    >
                      {createInventoryMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <PackagePlus className="mr-2 h-4 w-4" />
                      )}
                      Add Stock
                    </Button>
                  </form>
                </Form>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  This item is already stocked in all available warehouses, or no warehouses found.
                </p>
              ))}
          </div>
        </div>

        <DialogFooter className="mt-2 sm:mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
