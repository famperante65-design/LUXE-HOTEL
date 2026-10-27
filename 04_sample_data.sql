-- 04: OPTIONAL sample rooms so the Client page is not empty
insert into services (service_name, description, room_type, price, capacity, availability) values
('Standard Room', 'Cozy room with one double bed and aircon.', 'Standard', 1500, 2, 'Available'),
('Deluxe Room', 'Spacious room with city view and breakfast.', 'Deluxe', 2000, 3, 'Available'),
('Family Suite', 'Two bedrooms, kitchenette, good for families.', 'Suite', 3500, 5, 'Available');
