import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import type { WarehouseRead } from '@/api/schema.types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  square_footage: z.coerce
    .number()
    .positive({ message: 'Square footage must be a positive number.' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
  manager_name: z.string().min(2, { message: 'Manager name must be at least 2 characters.' }),
  phone: z.string().min(9, { message: 'Phone number must be at least 9 characters.' }),
  latitude: z.coerce
    .string()
    .refine(val => !isNaN(parseFloat(val)), { message: 'Latitude must be a valid number.' }),
  longitude: z.coerce
    .string()
    .refine(val => !isNaN(parseFloat(val)), { message: 'Longitude must be a valid number.' }),
});

// This type is what the form inputs will deal with (strings for lat/long)
export type WarehouseFormInputValues = z.input<typeof formSchema>;
// This type is what gets passed to onSubmit after Zod parsing (lat/long will be attempted to be coerced by schema if not numbers)
// However, our schema for lat/long outputs strings. We need WarehouseCreate/Update compatible types for onSubmit.
// The API expects latitude and longitude as `number | string` for create/update.
// The WarehouseRead schema has them as `string`. Let's make the form output match WarehouseRead for simplicity of defaultValues,
// and handle conversion to number for API in the Dialog component.

// Let's redefine the schema output to be strings for lat/long for form state consistency.
// The actual conversion to number (if API needs numbers) will be done before API call.
const processedFormSchema = formSchema.extend({
  latitude: z.string().refine(val => val === '' || !isNaN(parseFloat(val)), {
    message: 'Latitude must be a valid number or empty.',
  }),
  longitude: z.string().refine(val => val === '' || !isNaN(parseFloat(val)), {
    message: 'Longitude must be a valid number or empty.',
  }),
});

export type WarehouseSubmitValues = Omit<WarehouseRead, 'warehouse_id'>;

interface WarehouseFormProps {
  // onSubmit will receive data that can be used for create/update directly
  onSubmit: (data: WarehouseSubmitValues) => void;
  isLoading?: boolean;
  defaultValues?: WarehouseRead | null;
}

export function WarehouseForm({ onSubmit, isLoading, defaultValues }: WarehouseFormProps) {
  // form will use WarehouseRead compatible structure, so latitude/longitude are strings
  const form = useForm<WarehouseSubmitValues>({
    resolver: zodResolver(processedFormSchema), // Use schema that outputs strings for lat/long
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          square_footage: defaultValues.square_footage,
          address: defaultValues.address,
          manager_name: defaultValues.manager_name,
          phone: defaultValues.phone,
          latitude: defaultValues.latitude, // Already string from WarehouseRead
          longitude: defaultValues.longitude, // Already string from WarehouseRead
        }
      : {
          name: '',
          square_footage: 0,
          address: '',
          manager_name: '',
          phone: '',
          latitude: '',
          longitude: '',
        },
  });

  useEffect(() => {
    const resetValues = defaultValues
      ? {
          name: defaultValues.name,
          square_footage: defaultValues.square_footage,
          address: defaultValues.address,
          manager_name: defaultValues.manager_name,
          phone: defaultValues.phone,
          latitude: defaultValues.latitude,
          longitude: defaultValues.longitude,
        }
      : {
          name: '',
          square_footage: 0,
          address: '',
          manager_name: '',
          phone: '',
          latitude: '',
          longitude: '',
        };
    form.reset(resetValues);
  }, [defaultValues, form]);

  const handleFormSubmit = (data: WarehouseSubmitValues) => {
    // Before submitting, ensure lat/long are numbers if they are non-empty strings
    // The API Create/Update types allow string or number for lat/long.
    // If they are empty strings, the API might handle it or we might need to send null/undefined.
    // For now, we assume the API can take the string if it's a valid number representation.
    // Or, we can parse them here to numbers explicitly.
    const submissionData = {
      ...data,
      // The Zod schema for WarehouseCreate and WarehouseUpdate expects number | string for lat/long
      // Our WarehouseSubmitValues (derived from WarehouseRead) has them as string.
      // The API should be fine with string representation of numbers.
      // If API strictly needs numbers, parse here:
      // latitude: data.latitude ? parseFloat(data.latitude) : undefined,
      // longitude: data.longitude ? parseFloat(data.longitude) : undefined,
    };
    onSubmit(submissionData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Main Warehouse" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="square_footage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Square Footage</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="5000"
                  {...field}
                  value={
                    field.value === null || field.value === undefined ? '' : String(field.value)
                  }
                  onChange={e =>
                    field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, Anytown, USA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="manager_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manager Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="+1-555-123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input placeholder="34.0522" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input placeholder="-118.2437" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? defaultValues
              ? 'Saving Changes...'
              : 'Creating Warehouse...'
            : defaultValues
              ? 'Save Changes'
              : 'Create Warehouse'}
        </Button>
      </form>
    </Form>
  );
}
