export interface IServiceBooking {
  user: string;  // Changed from mongoose.Types.ObjectId to string for frontend
  services: {
    service: string;
    quantity?: number;
  }[];
  property?: string;
  scheduledDate: Date;
  scheduledTimeSlot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount?: number;
  requiresEstimate: boolean;
  notes?: string;
  contactDetails: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
} 