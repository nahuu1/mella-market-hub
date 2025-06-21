
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  // Initialize with some demo data if empty
  useEffect(() => {
    if (key === 'mella-services' && (!storedValue || storedValue.length === 0)) {
      const demoServices = [
        {
          id: '1',
          title: 'Professional House Cleaning',
          description: 'Deep cleaning service for homes and apartments. Includes all rooms, kitchen, and bathrooms.',
          price: 500,
          category: 'Cleaning',
          provider: 'Almaz Cleaning Services',
          rating: 4.8,
          distance: 2.3,
          image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
          location: { lat: 9.0245, lng: 38.7469 }
        },
        {
          id: '2',
          title: 'Food Delivery Service',
          description: 'Fast and reliable food delivery from local restaurants. Hot meals delivered to your door.',
          price: 50,
          category: 'Delivery',
          provider: 'FastEats Delivery',
          rating: 4.6,
          distance: 1.8,
          image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=300&fit=crop',
          location: { lat: 9.0200, lng: 38.7500 }
        },
        {
          id: '3',
          title: 'Computer Repair & Setup',
          description: 'Expert computer repair, software installation, and tech support services.',
          price: 800,
          category: 'Tech Support',
          provider: 'TechFix Ethiopia',
          rating: 4.9,
          distance: 3.5,
          image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=300&fit=crop',
          location: { lat: 9.0300, lng: 38.7400 }
        },
        {
          id: '4',
          title: 'Home Appliance Repair',
          description: 'Repair and maintenance for washing machines, refrigerators, and other home appliances.',
          price: 400,
          category: 'Home Repair',
          provider: 'FixIt Home Services',
          rating: 4.7,
          distance: 4.2,
          image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop',
          location: { lat: 9.0150, lng: 38.7550 }
        },
        {
          id: '5',
          title: 'English Tutoring',
          description: 'One-on-one English tutoring for students of all ages. Improve your speaking and writing skills.',
          price: 300,
          category: 'Tutoring',
          provider: 'Helen Language Center',
          rating: 4.9,
          distance: 1.5,
          image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
          location: { lat: 9.0280, lng: 38.7480 }
        },
        {
          id: '6',
          title: 'Event Photography',
          description: 'Professional photography services for weddings, birthdays, and corporate events.',
          price: 2000,
          category: 'Photography',
          provider: 'Capture Moments Studio',
          rating: 4.8,
          distance: 6.7,
          image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=300&fit=crop',
          location: { lat: 9.0350, lng: 38.7350 }
        }
      ];
      setValue(demoServices);
    }
  }, [key, storedValue, setValue]);

  return [storedValue, setValue] as const;
}
