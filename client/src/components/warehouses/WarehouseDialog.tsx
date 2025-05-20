import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
      toast.success('Warehouse created successfully!');
      onSuccess?.();
      onClose();
    },
    onError: err => {
      toast.error(`Error creating warehouse: ${err.message}`);
    },
  });

  const updateMutation = useMutation<
    WarehouseRead,
    Error,
    { warehouseId: number; data: WarehouseUpdate }
  >({
    mutationFn: ({ warehouseId, data }) => updateWarehouse(warehouseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse updated successfully!');
      onSuccess?.();
      onClose();
    },
    onError: err => {
      toast.error(`Error updating warehouse: ${err.message}`);
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
      updateMutation.mutate({
        warehouseId: warehouse.warehouse_id,
        data: payload as WarehouseUpdate,
      });
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
