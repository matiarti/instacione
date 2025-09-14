import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';

const registerOperatorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(1, 'Phone number is required'),
  companyName: z.string().min(1, 'Company name is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, companyName } = registerOperatorSchema.parse(body);

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new operator user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: 'OPERATOR',
      provider: 'credentials',
    });

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Operator account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName,
      },
    });

  } catch (error) {
    console.error('Operator registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create operator account' },
      { status: 500 }
    );
  }
}
