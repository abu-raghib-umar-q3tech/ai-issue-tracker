import { compare, hash } from 'bcryptjs';
import mongoose, { type HydratedDocument, type Model } from 'mongoose';

const USER_ROLES = ['user', 'admin'] as const;

type UserRole = (typeof USER_ROLES)[number];

interface UserAttributes {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserDocument = HydratedDocument<UserAttributes, UserMethods>;
type UserModel = Model<UserAttributes, object, UserMethods>;

const userSchema = new mongoose.Schema<UserAttributes, UserModel, UserMethods>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'user'
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function (this: UserDocument, next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  this.password = await hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return compare(candidatePassword, this.password);
};

const User = mongoose.model<UserAttributes, UserModel>('User', userSchema);

export { User, USER_ROLES };
export type { UserAttributes, UserDocument, UserMethods, UserRole };
