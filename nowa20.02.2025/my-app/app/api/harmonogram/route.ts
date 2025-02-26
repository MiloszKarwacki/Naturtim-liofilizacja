import { NextRequest, NextResponse } from "next/server";
import { ScheduleService } from "./service";

export async function GET() {
  try {
    const data = await ScheduleService.getScheduleData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching schedule data:", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać danych harmonogramu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const processData = await request.json();
    const result = await ScheduleService.addProcess(processData);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error adding process:", error);
    return NextResponse.json(
      { error: "Nie udało się dodać procesu" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const processData = await request.json();
    const result = await ScheduleService.updateProcess(processData);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating process:", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować procesu" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Brakujący parametr id" },
        { status: 400 }
      );
    }
    
    await ScheduleService.deleteProcess(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting process:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć procesu" },
      { status: 500 }
    );
  }
} 