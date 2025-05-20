import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { createItem, updateItem } from '@/api/item';
import type { ItemCreate, ItemReadWithInventory, ItemUpdate } from '@/api/schema.types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
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
import { Textarea } from '@/components/ui/textarea';
// TODO: Add toast notifications for success/error

const itemFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().min(1, 'Description is required').max(2000),
  sku: z.string().max(100).optional().nullable(), // SKU is optional
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item?: ItemReadWithInventory | null; // For editing
  onSuccess?: () => void; // Callback on successful create/update
}

export function ItemDialog({ isOpen, onClose, item, onSuccess }: ItemDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!item;

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: '',
      description: '',
      sku: '',
    },
  });

  useEffect(() => {
    if (isEditMode && item) {
      form.reset({
        name: item.name,
        description: item.description,
        sku: item.sku || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        sku: '',
      });
    }
  }, [isEditMode, item, form, isOpen]); // Reset form when dialog opens or item changes

  const createMutation = useMutation<ItemReadWithInventory, Error, ItemCreate>({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item created successfully!');
      onSuccess?.();
      onClose();
    },
    onError: err => {
      toast.error(`Error creating item: ${err.message}`);
    },
  });

  const updateMutation = useMutation<
    ItemReadWithInventory,
    Error,
    { itemId: number; data: ItemUpdate }
  >({
    mutationFn: ({ itemId, data }) => updateItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item updated successfully!');
      onSuccess?.();
      onClose();
    },
    onError: err => {
      toast.error(`Error updating item: ${err.message}`);
    },
  });

  const onSubmit = (values: ItemFormValues) => {
    const dataToSubmit = {
      ...values,
      sku: values.sku || null, // Ensure SKU is null if empty string
    };

    if (isEditMode && item) {
      updateMutation.mutate({ itemId: item.item_id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Item' : 'Create New Item'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the details of the item.'
              : 'Fill in the form below to add a new item to the inventory.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Industrial Shelving Unit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a detailed description of the item..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., SKU-12345-XYZ" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
