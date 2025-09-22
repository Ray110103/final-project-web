import { useState, useEffect, useCallback } from "react";
import { axiosInstance } from "@/lib/axios";
import { Room } from "@/types/room";

interface RoomError {
  type: 'empty' | 'auth' | 'network' | 'server' | 'forbidden' | 'unknown';
  message: string;
  statusCode?: number;
}

const useGetRoomsByProperty = (propertySlug: string) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<RoomError | null>(null);

  // Function to refetch rooms based on the property slug
  const refetchRooms = useCallback(async (slug: string) => {
    if (!slug) {
      setRooms([]);
      setError(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching rooms for property: ${slug}`);
      
      // CORRECT ENDPOINT: Based on your router setup:
      // RoomRouter: "/property/:slug/rooms" 
      // App.ts: "/rooms" 
      // Full endpoint: "/rooms/property/:slug/rooms"
      const response = await axiosInstance.get(`/rooms/property/${slug}/rooms`);
      
      console.log('Rooms response:', response.data);
      
      // Handle successful response
      if (response.data && Array.isArray(response.data)) {
        if (response.data.length === 0) {
          // Property exists but has no rooms - this is a valid state, not an error
          setRooms([]);
          setError({
            type: 'empty',
            message: 'This property does not have any rooms yet. Create a room first to manage availability.',
            statusCode: 200
          });
        } else {
          setRooms(response.data);
          setError(null);
        }
      } else {
        // Unexpected response format
        setRooms([]);
        setError({
          type: 'server',
          message: 'Received unexpected response format from server.',
          statusCode: response.status
        });
      }
      
    } catch (error: any) {
      console.error("Error fetching rooms for property:", slug, error);
      
      setRooms([]);
      
      if (error.response) {
        const statusCode = error.response.status;
        
        switch (statusCode) {
          case 401:
            setError({
              type: 'auth',
              message: 'Authentication failed. Please log in again.',
              statusCode: 401
            });
            break;
            
          case 403:
            setError({
              type: 'forbidden',
              message: 'Access denied. You do not have permission to view rooms for this property.',
              statusCode: 403
            });
            break;
            
          case 404:
            // Property not found OR no rooms found
            // We need to distinguish between these cases
            const errorMessage = error.response.data?.message || '';
            
            if (errorMessage.toLowerCase().includes('property') || 
                errorMessage.toLowerCase().includes('not found')) {
              setError({
                type: 'server',
                message: 'Property not found or does not exist.',
                statusCode: 404
              });
            } else {
              // No rooms found for existing property - treat as empty state
              setError({
                type: 'empty',
                message: 'This property does not have any rooms yet. Create a room first to manage availability.',
                statusCode: 404
              });
            }
            break;
            
          case 500:
            setError({
              type: 'server',
              message: 'Server error occurred while fetching rooms. Please try again later.',
              statusCode: 500
            });
            break;
            
          default:
            setError({
              type: 'server',
              message: `Server error (${statusCode}). Please try again.`,
              statusCode
            });
        }
      } else if (error.request) {
        // Network error - no response received
        setError({
          type: 'network',
          message: 'Unable to connect to server. Please check your internet connection and try again.'
        });
      } else {
        // Other error (request setup, etc.)
        setError({
          type: 'unknown',
          message: 'An unexpected error occurred. Please refresh the page and try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to fetch rooms when propertySlug changes
  useEffect(() => {
    if (propertySlug) {
      refetchRooms(propertySlug);
    } else {
      setRooms([]);
      setError(null);
      setLoading(false);
    }
  }, [propertySlug, refetchRooms]);

  return { 
    rooms, 
    loading, 
    error, 
    refetchRooms,
    // Utility functions to check error types
    isEmpty: error?.type === 'empty',
    isNetworkError: error?.type === 'network',
    isAuthError: error?.type === 'auth',
    isServerError: error?.type === 'server',
    isForbiddenError: error?.type === 'forbidden'
  };
};

export default useGetRoomsByProperty;