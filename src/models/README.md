# Models Reference

This document describes the collections used by the backend and the expected JSON shape for MongoDB Atlas.

## users
Stores authentication and user profile information.

Example document:
```json
{
  "_id": "ObjectId(\"64bfcf...\")",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$12$...",
  "role": "farmer",
  "profileImage": null,
  "createdAt": "ISODate(\"2026-06-18T12:00:00Z\")"
}
```

Fields:
- `_id`: ObjectId
- `name`: string
- `email`: string (unique)
- `password`: bcrypt hashed string
- `role`: `farmer` or `admin`
- `profileImage`: string or null
- `createdAt`: timestamp

## disease_records
Stores disease prediction reports.

Example document:
```json
{
  "_id": "ObjectId(\"64bfd123...\")",
  "userId": "ObjectId(\"64bfd000...\")",
  "imageUrl": "https://res.cloudinary.com/.../disease.jpg",
  "prediction": "Tomato___Early_blight",
  "confidence": 0.92,
  "treatment": "Remove lower infected leaves, mulch soil, stake plants, rotate crops, and apply chlorothalonil or mancozeb products.",
  "createdAt": "ISODate(\"2026-06-18T12:15:00Z\")"
}
```

Fields:
- `_id`: ObjectId
- `userId`: ObjectId
- `imageUrl`: string
- `prediction`: string
- `confidence`: number
- `treatment`: string
- `createdAt`: timestamp

## soil_records
Stores soil analysis results.

Example document:
```json
{
  "_id": "ObjectId(\"64bfd456...\")",
  "userId": "ObjectId(\"64bfd000...\")",
  "input": {
    "nitrogen": 120,
    "phosphorus": 60,
    "potassium": 150,
    "ph": 6.5,
    "moisture": 35,
    "cropType": "Tomato",
    "location": "Farm 1"
  },
  "analysis": {
    "healthScore": 72,
    "fertilityLevel": "moderate",
    "nutrients": {
      "nitrogen": "adequate",
      "phosphorus": "adequate",
      "potassium": "good"
    }
  },
  "recommendation": "Add compost and maintain balanced irrigation.",
  "createdAt": "ISODate(\"2026-06-18T12:20:00Z\")"
}
```

Fields:
- `_id`: ObjectId
- `userId`: ObjectId
- `input`: object
- `analysis`: object
- `recommendation`: string
- `createdAt`: timestamp

## weather_records
Stores weather lookups and forecast data.

Example document:
```json
{
  "_id": "ObjectId(\"64bfd789...\")",
  "userId": "ObjectId(\"64bfd000...\")",
  "type": "current",
  "location": {
    "latitude": 23.8103,
    "longitude": 90.4125,
    "name": "Dhaka"
  },
  "weather": {
    "observedAt": "2026-06-18T12:20:00Z",
    "temperature": 32.1,
    "humidity": 78,
    "weatherCode": 3,
    "windSpeed": 12.4,
    "units": {
      "temperature": "°C",
      "humidity": "%",
      "windSpeed": "m/s"
    }
  },
  "createdAt": "ISODate(\"2026-06-18T12:21:00Z\")"
}
```

Fields:
- `_id`: ObjectId
- `userId`: ObjectId
- `type`: string (`current` or `forecast`)
- `location`: object
- `weather`: object
- `createdAt`: timestamp

## crop_recommendations
Stores crop suitability recommendations.

Example document:
```json
{
  "_id": "ObjectId(\"64bfea12...\")",
  "userId": "ObjectId(\"64bfd000...\")",
  "input": {
    "nitrogen": 90,
    "phosphorus": 55,
    "potassium": 140,
    "ph": 6.8,
    "temperature": 28,
    "rainfall": 90,
    "humidity": 70,
    "soilType": "loamy",
    "season": "monsoon",
    "location": "Field A"
  },
  "recommendations": [
    { "crop": "Tomato", "suitabilityScore": 91.2, "reason": "..." },
    { "crop": "Maize", "suitabilityScore": 84.5, "reason": "..." }
  ],
  "createdAt": "ISODate(\"2026-06-18T12:25:00Z\")"
}
```

Fields:
- `_id`: ObjectId
- `userId`: ObjectId
- `input`: object
- `recommendations`: array
- `createdAt`: timestamp

## products
Stores marketplace products.

Example document:
```json
{
  "_id": "ObjectId(\"64bfec34...\")",
  "name": "Organic Fertilizer",
  "description": "Balanced NPK fertilizer for vegetables.",
  "price": 350.0,
  "category": "fertilizer",
  "stock": 50,
  "imageUrl": "https://res.cloudinary.com/.../product.jpg",
  "createdAt": "ISODate(\"2026-06-18T12:30:00Z\")",
  "updatedAt": "ISODate(\"2026-06-18T12:30:00Z\")"
}
```

Fields:
- `_id`: ObjectId
- `name`: string
- `description`: string
- `price`: number
- `category`: string
- `stock`: number
- `imageUrl`: string or null
- `createdAt`: timestamp
- `updatedAt`: timestamp

## orders
Stores user product orders.

Example document:
```json
{
  "_id": "ObjectId(\"64bfed56...\")",
  "userId": "ObjectId(\"64bfd000...\")",
  "items": [
    {
      "productId": "ObjectId(\"64bfec34...\")",
      "name": "Organic Fertilizer",
      "imageUrl": "https://res.cloudinary.com/.../product.jpg",
      "quantity": 2,
      "price": 350.0
    }
  ],
  "shippingAddress": {
    "address": "123 Farm Road",
    "city": "Dhaka",
    "postalCode": "1207",
    "country": "Bangladesh"
  },
  "totalAmount": 700.0,
  "status": "pending",
  "createdAt": "ISODate(\"2026-06-18T12:35:00Z\")"
}
```

Fields:
- `_id`: ObjectId
- `userId`: ObjectId
- `items`: array
- `shippingAddress`: object or null
- `totalAmount`: number
- `status`: string
- `createdAt`: timestamp

## chat_history
Stores chatbot conversation records.

Example document:
```json
{
  "_id": "ObjectId(\"64bfef78...\")",
  "userId": "ObjectId(\"64bfd000...\")",
  "question": "What is the best fertilizer for tomato?",
  "answer": "Use balanced NPK fertilizer with higher potassium and regular soil moisture monitoring.",
  "createdAt": "ISODate(\"2026-06-18T12:40:00Z\")"
}
```

Fields:
- `_id`: ObjectId
- `userId`: ObjectId
- `question`: string
- `answer`: string
- `createdAt`: timestamp
