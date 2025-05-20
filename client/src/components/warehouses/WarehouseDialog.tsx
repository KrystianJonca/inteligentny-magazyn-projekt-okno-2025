import { useMutation, useQueryClient } from '@tanstack/react-query';

import { WarehouseForm, type WarehouseSubmitValues } from './WarehouseForm';

import type { WarehouseRead, WarehouseCreate, WarehouseUpdate } from '@/api/schema.types';
import { createWarehouse, updateWarehouse } from '@/api/warehouse';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WarehouseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse?: WarehouseRead | null; // Current warehouse for editing, null for create
  onSuccess?: () => void; // Callback on successful operation
}

export function WarehouseDialog({ isOpen, onClose, warehouse, onSuccess }: WarehouseDialogProps) {
  const queryClient = useQueryClient();

  const createMutation = useMutation<WarehouseRead, Error, WarehouseCreate>({
    mutationFn: createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      onSuccess?.();
      onClose(); // Close dialog on success
    },
    onError: error => {
      // TODO: Display error to user (e.g., toast notification)
      console.error('Error creating warehouse:', error);
    },
  });

  const updateMutation = useMutation<WarehouseRead, Error, { id: number; data: WarehouseUpdate }>({
    mutationFn: ({ id, data }) => updateWarehouse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse', warehouse?.warehouse_id] }); // Invalidate specific warehouse query if viewing details elsewhere
      onSuccess?.();
      onClose(); // Close dialog on success
    },
    onError: error => {
      console.error('Error updating warehouse:', error);
    },
  });

  const handleSubmit = (data: WarehouseSubmitValues) => {
    const payload = {
      ...data,
      latitude:
        data.latitude === ''
          ? undefined
          : typeof data.latitude === 'string'
            ? parseFloat(data.latitude)
            : data.latitude,
      longitude:
        data.longitude === ''
          ? undefined
          : typeof data.longitude === 'string'
            ? parseFloat(data.longitude)
            : data.longitude,
      square_footage:
        typeof data.square_footage === 'string'
          ? parseFloat(data.square_footage)
          : data.square_footage,
    };

    if (warehouse && warehouse.warehouse_id) {
      updateMutation.mutate({ id: warehouse.warehouse_id, data: payload as WarehouseUpdate });
    } else {
      createMutation.mutate(payload as WarehouseCreate);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] md:sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{warehouse ? 'Edit Warehouse' : 'Create New Warehouse'}</DialogTitle>
          <DialogDescription>
            {warehouse
              ? 'Make changes to your warehouse here.'
              : 'Fill in the details to create a new warehouse.'}
          </DialogDescription>
        </DialogHeader>

        <WarehouseForm onSubmit={handleSubmit} isLoading={isLoading} defaultValues={warehouse} />
      </DialogContent>
    </Dialog>
  );
}
