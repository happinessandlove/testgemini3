export interface FlightDeal {
  id: number;
  destination: string;
  date: string;
  price: number;
  imageUrl: string;
  rank?: number;
}

export enum TravelType {
  FLIGHT = 'Flight',
  TRAIN = 'Train',
  HOTEL = 'Hotel',
  VACATION = 'Vacation',
  TICKET = 'Ticket'
}

export interface AIRecommendation {
  city: string;
  reason: string;
  estimatedPrice: number;
}
