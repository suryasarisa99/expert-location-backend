import { model, Schema, Document } from "mongoose";

// const TeacherSchema = new Schema({
//   _id: {
//     type: String,
//     required: true,
//   },
//   name: {
//     type: String,
//     required: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   img: String,
//   email: {
//     type: String,
//   },
//   phone: {
//     type: Number,
//   },
//   requests: [
//     {
//       _id: {
//         type: String,
//         required: true,
//         unique: false,
//       },
//       name: String,
//       status: {
//         type: String,
//         enum: ["pending", "accepted", "rejected", "-"],
//         default: "-",
//       },
//     },
//   ],

//   yearsOfExperience: Number,
//   workExperiences: [
//     {
//       company: String,
//       position: String,
//       from: Number,
//       to: Number,
//     },
//   ],
//   educations: [
//     {
//       institute: String,
//       degree: String,
//       from: Number,
//       to: Number,
//     },
//   ],
//   skills: {
//     type: [
//       {
//         name: String,
//         level: Number,
//       },
//     ],
//   },

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
//   // latitude: Number,
//   // longitude: Number,
// });

// Define an interface for the teacher document
interface ITeacher extends Document {
  _id: string;
  name: string;
  password: string;
  img?: string;
  email?: string;
  phone?: number;
  requests?: {
    _id: string;
    name?: string;
    status?: "pending" | "accepted" | "rejected" | "-";
  }[];
  yearsOfExperience?: number;
  workExperiences?: {
    company?: string;
    position?: string;
    from?: number;
    to?: number;
  }[];
  educations?: {
    institute?: string;
    degree?: string;
    from?: number;
    to?: number;
  }[];
  skills?: {
    name?: string;
    level?: number;
  }[];
  about?: string;
  address?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  latitude?: number;
  longitude?: number;
}

// Define the teacher schema
const TeacherSchema = new Schema<ITeacher>({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  img: String,
  email: {
    type: String,
  },
  phone: {
    type: Number,
  },
  requests: [
    {
      _id: {
        type: String,
        required: true,
        unique: false,
      },
      name: String,
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "-"],
        default: "-",
      },
    },
  ],

  yearsOfExperience: Number,
  workExperiences: [
    {
      company: String,
      position: String,
      from: Number,
      to: Number,
    },
  ],
  educations: [
    {
      institute: String,
      degree: String,
      from: Number,
      to: Number,
    },
  ],
  skills: {
    type: [
      {
        name: String,
        level: Number,
      },
    ],
  },

  about: String,
  address: String,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: undefined,
    },
  },
  latitude: Number,
  longitude: Number,
});

// Create the teacher model
const Tutor = model<ITeacher>("Teacher", TeacherSchema);

export default Tutor;
