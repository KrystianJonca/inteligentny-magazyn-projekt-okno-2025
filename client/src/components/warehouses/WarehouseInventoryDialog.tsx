import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2, PackagePlus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  createInventory,
  deleteInventory,
  getInventoryByWarehouse,
  updateInventory,
} from '@/api/inventory';
import { getItems } from '@/api/item'; // For adding new items
import type {
  InventoryCreate,
  InventoryRead,
  InventoryWithItem,
  ItemReadWithInventory,
  PaginatedItems,
  WarehouseRead,
} from '@/api/schema.types';
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

interface WarehouseInventoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse: WarehouseRead;
}

const AddItemToWarehouseFormSchema = z.object({
  item_id: z.string().min(1, 'Item is required.'), // Will be parsed to number
  quantity: z.coerce.number().min(0, 'Quantity must be 0 or greater.'),
});
type AddItemToWarehouseFormValues = z.infer<typeof AddItemToWarehouseFormSchema>;

export function WarehouseInventoryDialog({
  isOpen,
  onClose,
  warehouse,
}: WarehouseInventoryDialogProps) {
  const queryClient = useQueryClient();
  const [editedQuantities, setEditedQuantities] = useState<{ [itemId: number]: string }>({});

  const {
    data: warehouseInventory,
    isLoading: isLoadingInventory,
    error: errorInventory,
  } = useQuery<InventoryWithItem[], Error>({
    queryKey: ['inventory', warehouse.warehouse_id], // Keyed by warehouse_id
    queryFn: () => getInventoryByWarehouse(warehouse.warehouse_id),
    enabled: isOpen,
  });

  const {
    data: allItemsData,
    isLoading: isLoadingAllItems,
    // error: errorAllItems, // Will handle error inline
  } = useQuery<PaginatedItems, Error>({
    queryKey: ['allItemsForSelect'], // Distinct query key for all items
    queryFn: () => getItems({ page: 1, page_size: 100 }), // Corrected page_size to 100
    enabled: isOpen,
  });
  const allItems: ItemReadWithInventory[] = allItemsData?.items || [];

  const handleQuantityChange = (itemId: number, value: string) => {
    setEditedQuantities(prev => ({ ...prev, [itemId]: value }));
  };

  useEffect(() => {
    if (isOpen && warehouseInventory) {
      const initialQuantities: { [itemId: number]: string } = {};
      warehouseInventory.forEach(inv => {
        initialQuantities[inv.item_id] = String(inv.quantity);
      });
      setEditedQuantities(initialQuantities);
    }
  }, [isOpen, warehouseInventory]);

  const updateMutation = useMutation<InventoryRead, Error, { itemId: number; quantity: number }>({
    mutationFn: ({ itemId, quantity }) =>
      updateInventory(warehouse.warehouse_id, itemId, { quantity }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', warehouse.warehouse_id] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success(`Stock updated for item ${variables.itemId}`);
    },
    onError: (error, variables) => {
      toast.error(`Error updating stock for item ${variables.itemId}: ${error.message}`);
      setEditedQuantities(prev => ({
        ...prev,
        [variables.itemId]: String(
          warehouseInventory?.find(inv => inv.item_id === variables.itemId)?.quantity || '0'
        ),
      }));
    },
  });

  const deleteInventoryMutation = useMutation<void, Error, { itemId: number }>({
    mutationFn: ({ itemId }) => deleteInventory(warehouse.warehouse_id, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', warehouse.warehouse_id] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success(`Item ${variables.itemId} removed from warehouse`);
    },
    onError: (error, variables) => {
      toast.error(`Error removing item ${variables.itemId} from warehouse: ${error.message}`);
    },
  });

  const handleSaveQuantity = (itemId: number) => {
    const newQuantityStr = editedQuantities[itemId];
    const newQuantity = parseInt(newQuantityStr, 10);
    if (isNaN(newQuantity) || newQuantity < 0) {
      console.error('Invalid quantity');
      setEditedQuantities(prev => ({
        ...prev,
        [itemId]: String(warehouseInventory?.find(inv => inv.item_id === itemId)?.quantity || '0'),
      }));
      return;
    }
    const originalInv = warehouseInventory?.find(inv => inv.item_id === itemId);
    if (originalInv && originalInv.quantity !== newQuantity) {
      updateMutation.mutate({ itemId, quantity: newQuantity });
    }
  };

  const handleRemoveItemFromWarehouse = (itemId: number) => {
    if (
      window.confirm(
        'Are you sure you want to remove this item from this warehouse inventory? This action cannot be undone.'
      )
    ) {
      deleteInventoryMutation.mutate({ itemId });
    }
  };

  const addItemToWarehouseForm = useForm<AddItemToWarehouseFormValues>({
    resolver: zodResolver(AddItemToWarehouseFormSchema),
    defaultValues: {
      item_id: '',
      quantity: 0,
    },
  });

  const createInventoryMutation = useMutation<InventoryRead, Error, InventoryCreate>({
    mutationFn: createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', warehouse.warehouse_id] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      addItemToWarehouseForm.reset();
      toast.success('Item added to warehouse inventory successfully!');
    },
    onError: error => {
      let errorMessage = 'Error adding item to warehouse inventory.';
      if (error.message.includes('already exists')) {
        errorMessage = 'This item already exists in this warehouse.';
        addItemToWarehouseForm.setError('item_id', {
          type: 'manual',
          message: errorMessage,
        });
      } else if (error.message.includes('not found')) {
        errorMessage = 'Selected item not found. Please refresh.';
        addItemToWarehouseForm.setError('item_id', {
          type: 'manual',
          message: errorMessage,
        });
      } else {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    },
  });

  const handleAddItemToWarehouseSubmit = (values: AddItemToWarehouseFormValues) => {
    createInventoryMutation.mutate({
      warehouse_id: warehouse.warehouse_id,
      item_id: parseInt(values.item_id, 10),
      quantity: values.quantity,
    });
  };

  const availableItemsForAdding =
    allItems.filter(item => !warehouseInventory?.some(inv => inv.item_id === item.item_id)) || [];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Inventory for: {warehouse.name}</DialogTitle>
          <DialogDescription>
            Update item quantities for this warehouse or add new items to its stock.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Section 1: Current Stocked Items */}
          <div>
            <h3 className="text-lg font-medium mb-2">Stocked Items</h3>
            {isLoadingInventory && (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {errorInventory && (
              <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>Error loading warehouse inventory: {errorInventory.message}</span>
              </div>
            )}
            {!isLoadingInventory &&
              !errorInventory &&
              (warehouseInventory && warehouseInventory.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="w-[120px] text-right">Quantity</TableHead>
                        <TableHead className="w-[100px] text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {warehouseInventory.map(inv => (
                        <TableRow key={inv.item_id}>
                          <TableCell className="font-medium">{inv.item.name}</TableCell>
                          <TableCell>{inv.item.sku || '-'}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={editedQuantities[inv.item_id] || '0'}
                              onChange={e => handleQuantityChange(inv.item_id, e.target.value)}
                              className="h-9 w-24 inline-block text-right"
                              min="0"
                            />
                          </TableCell>
                          <TableCell className="text-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveQuantity(inv.item_id)}
                              disabled={
                                (updateMutation.isPending &&
                                  updateMutation.variables?.itemId === inv.item_id) ||
                                String(inv.quantity) === editedQuantities[inv.item_id]
                              }
                              title="Save quantity"
                            >
                              {updateMutation.isPending &&
                              updateMutation.variables?.itemId === inv.item_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              <span className="sr-only">Save</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItemFromWarehouse(inv.item_id)}
                              disabled={
                                deleteInventoryMutation.isPending &&
                                deleteInventoryMutation.variables?.itemId === inv.item_id
                              }
                              title="Remove item from warehouse"
                              className="text-red-600 hover:text-red-700"
                            >
                              {deleteInventoryMutation.isPending &&
                              deleteInventoryMutation.variables?.itemId === inv.item_id ? (
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
                  No items are currently stocked in this warehouse.
                </p>
              ))}
          </div>

          <Separator />

          {/* Section 2: Add New Item to this Warehouse */}
          <div>
            <h3 className="text-lg font-medium mb-3">Add New Item to Warehouse</h3>
            {isLoadingAllItems && (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {/* TODO: Handle errorAllItems explicitly if needed */}
            {!isLoadingAllItems &&
              allItems &&
              (availableItemsForAdding.length > 0 ? (
                <Form {...addItemToWarehouseForm}>
                  <form
                    onSubmit={addItemToWarehouseForm.handleSubmit(handleAddItemToWarehouseSubmit)}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-end"
                  >
                    <FormField
                      control={addItemToWarehouseForm.control}
                      name="item_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Item</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose an item" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableItemsForAdding.map(i => (
                                <SelectItem key={i.item_id} value={String(i.item_id)}>
                                  {i.name} (SKU: {i.sku || 'N/A'})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addItemToWarehouseForm.control}
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
                      Add Item to Stock
                    </Button>
                  </form>
                </Form>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  All available items are already stocked in this warehouse, or no items found.
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
