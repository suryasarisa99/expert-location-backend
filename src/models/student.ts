import { Schema, model, Document } from "mongoose";

// const StudentSchema = new Schema({
//   _id: {
//     type: String,
//     required: true,
//   },
//   name: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   img: String,
//   phone: Number,
//   latitude: Number,
//   longitude: Number,
//   about: String,
//   address: String,
//   location: {
//     type: {
//       type: String,
//       enum: ["Point"],
//       default: "Point",
//     },
//     coordinates: {
//       type: [Number],
//       default: undefined,
//     },
//   },
// });

// const Student = model("Student", StudentSchema);

interface IStudent extends Document {
  _id: string;
  name: string;
  email?: string;
  password: string;
  img?: string;
  phone?: number;
  about?: string;
  address?: string;
  location?: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
}

// Define the student schema
const StudentSchema = new Schema<IStudent>({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  img: String,
  phone: Number,
  about: String,
  address: String,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], //[longitude, latitude]
      default: undefined,
    },
  },
});

// Create the student model
const Student = model<IStudent>("Student", StudentSchema);

export default Student;
