import { NextResponse } from 'next/server';
import { addMealServer, getMealsServer } from '@/lib/meals';
import { MealInput } from '@/types/meal';

export async function GET() {
  try {
    const meals = await getMealsServer();
    return NextResponse.json(meals);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MealInput;
    const meal = await addMealServer(body);
    return NextResponse.json(meal, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
