import { NextRequest, NextResponse } from "next/server";
import { sendChatMessage, type RetellChatMessage } from "@/lib/retell";

// Fallback responses when Retell is not configured
const fallbackResponses: Record<string, string> = {
  programs: `Great question! Mystros Barber Academy offers several programs:

- **Class A Barber (1500 hours)** - Full barbering license
- **Barber Crossover (300 hours)** - For licensed cosmetologists
- **Barber Instructor (750 hours)** - Teach the next generation

Would you like more details about any of these programs?`,

  apply: `I'd love to help you get started! Here's what you need to apply:

1. **Valid ID** - Driver's license or state ID
2. **High School Diploma or GED**
3. **Application Form** - Complete online

You can start your application at our Apply page, or I can have an admissions counselor contact you.`,

  financial: `Mystros offers several financial aid options:

- **Federal Financial Aid** (FAFSA eligible)
- **VA Benefits** for veterans
- **Payment Plans** available

Would you like to speak with our financial aid team?`,

  hours: `Our typical schedules are:

- **Full-Time Day**: Mon-Fri, 8:30 AM - 4:30 PM
- **Part-Time Evening**: Mon-Fri, 5:00 PM - 9:00 PM

Classes start monthly! Would you like to tour our campus?`,

  default: `Welcome to Mystros Barber Academy! I'm here to help you start your barbering career.

I can help you with:
- **Program Information** - Learn about our courses
- **Admissions** - Start your application
- **Financial Aid** - Explore funding options
- **Scheduling** - Tour our campus

How can I assist you today?`,
};

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("program") || lowerMessage.includes("course") || lowerMessage.includes("class")) {
    return fallbackResponses["programs"] ?? fallbackResponses["default"] ?? "";
  }
  if (lowerMessage.includes("apply") || lowerMessage.includes("enroll") || lowerMessage.includes("start")) {
    return fallbackResponses["apply"] ?? fallbackResponses["default"] ?? "";
  }
  if (lowerMessage.includes("financial") || lowerMessage.includes("aid") || lowerMessage.includes("tuition") || lowerMessage.includes("cost") || lowerMessage.includes("pay")) {
    return fallbackResponses["financial"] ?? fallbackResponses["default"] ?? "";
  }
  if (lowerMessage.includes("hour") || lowerMessage.includes("schedule") || lowerMessage.includes("time")) {
    return fallbackResponses["hours"] ?? fallbackResponses["default"] ?? "";
  }

  return fallbackResponses["default"] ?? "";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: RetellChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Try Retell API first
    const retellResponse = await sendChatMessage(messages);

    if (retellResponse?.response) {
      return NextResponse.json({
        success: true,
        response: retellResponse.response,
        response_id: retellResponse.response_id,
      });
    }

    // Fallback to local responses
    const lastUserMessage = messages
      .filter((m) => m.role === "user")
      .pop();

    const fallbackResponse = getFallbackResponse(
      lastUserMessage?.content || ""
    );

    return NextResponse.json({
      success: true,
      response: fallbackResponse,
      fallback: true,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
