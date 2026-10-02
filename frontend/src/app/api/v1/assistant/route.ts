import { NextRequest, NextResponse } from "next/server";
import { AssistantRequestSchema, AssistantResponse } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = AssistantRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid assistant payload", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { message, locale, context } = parseResult.data;
    const lowerQuery = message.toLowerCase();

    const fieldName = context?.fieldOverview?.name || "your field";
    const district = context?.fieldOverview?.district || "Bangladesh";
    const salinity = context?.diagnostics?.soil?.ecValue ?? 2.0;
    const optimalCrop1 = context?.recommendations?.optimalSequence?.[0]?.cropNameEn || "Mustard";
    const optimalCrop1Bn = context?.recommendations?.optimalSequence?.[0]?.cropNameBn || "সরিষা";
    const optimalCrop2 = context?.recommendations?.optimalSequence?.[1]?.cropNameEn || "Mung Bean";
    const optimalCrop2Bn = context?.recommendations?.optimalSequence?.[1]?.cropNameBn || "মুগডাল";
    const optimalCrop3 = context?.recommendations?.optimalSequence?.[2]?.cropNameEn || "T. Aman Rice";
    const optimalCrop3Bn = context?.recommendations?.optimalSequence?.[2]?.cropNameBn || "রোপা আমন ধান";

    let replyEn = "";
    let replyBn = "";
    const referencedFactors: string[] = [];
    const suggestedFollowUps: string[] = [];

    if (lowerQuery.includes("fertilizer") || lowerQuery.includes("urea") || lowerQuery.includes("সার") || lowerQuery.includes("ইউরিয়া")) {
      referencedFactors.push("Nitrogen Fixation (Legume Phase)", "Residual Phosphorus", "Green Manuring");
      replyEn = `By rotating with ${optimalCrop2} (Mung bean / Legume), root nodule rhizobia fix roughly 45–60 kg of atmospheric nitrogen per hectare into the soil profile. Consequently, you can reduce chemical urea application for the subsequent ${optimalCrop3} by 25–30%, saving about ৳2,200–৳3,000 per acre in input costs while enhancing soil microbiome health.`;
      replyBn = `${optimalCrop2Bn} (ডাল জাতীয় ফসল) চাষের মাধ্যমে মাটিতে হেক্টর প্রতি প্রায় ৪৫-৬০ কেজি প্রাকৃতিক নাইট্রোজেন জমা হয়। এর ফলে পরবর্তী ${optimalCrop3Bn} চাষের সময় ২৫-৩০% ইউরিয়া সার কম প্রয়োগ করলেও চলে, যা প্রতি একরে প্রায় ২,২০০ থেকে ৩,০০০ টাকা সাশ্রয় করে।`;
      suggestedFollowUps.push(
        "How do I apply Rhizobium inoculant?",
        "What is the pest management schedule?",
        "Can I replace mustard with potato?"
      );
    } else if (lowerQuery.includes("water") || lowerQuery.includes("irrigation") || lowerQuery.includes("পানি") || lowerQuery.includes("সেচ")) {
      referencedFactors.push("Crop Water Footprint", "AWD Method", "Aquifer Depletion");
      replyEn = `The proposed 3-crop rotation (${optimalCrop1} → ${optimalCrop2} → ${optimalCrop3}) consumes ~40% less irrigation water compared to continuous Boro-Aman double rice. Mustard requires only 1–2 light irrigations, and Mung bean relies mostly on residual spring soil moisture and pre-monsoon showers.`;
      replyBn = `প্রস্তাবিত ৩-ফসলি বিন্যাস (${optimalCrop1Bn} → ${optimalCrop2Bn} → ${optimalCrop3Bn}) প্রচলিত বোরো-আমন চাষের তুলনায় প্রায় ৪০% সেচের পানি সাশ্রয় করে। সরিষায় মাত্র ১-২টি হালকা সেচ লাগে এবং মুগডাল মূলত মাটির অবশিষ্ট রস ও মৌসুমের বৃষ্টিতেই চমৎকার ফলন দেয়।`;
      suggestedFollowUps.push(
        "How much diesel cost do I save on pumping?",
        "What if pre-monsoon rain is delayed?",
        "Is drip irrigation beneficial here?"
      );
    } else if (lowerQuery.includes("salinity") || lowerQuery.includes("salt") || lowerQuery.includes("লবণ") || lowerQuery.includes("লবণাক্ততা")) {
      referencedFactors.push("Capillary Salt Rise", "Root Osmotic Potential", "Salt-Tolerant Cultivars");
      replyEn = `At ${salinity} dS/m EC in ${district}, dry season capillary action pulls subsoil salts to the surface. Our engine selected salt-tolerant varieties like ${optimalCrop1} and green manure to maintain root vegetative vigor and flush active salt accumulation before transplanting.`;
      replyBn = `${district} অঞ্চলে মাটির লবণাক্ততা (${salinity} dS/m) শুষ্ক মৌসুমে বাষ্পীভবনের কারণে বৃদ্ধি পায়। এজন্য আমাদের ইঞ্জিন ${optimalCrop1Bn} ও জৈব সবুজ সার বাছাই করেছে যাতে শিকড় স্তরে লবণ নিষ্কাশন সহজ হয় এবং ফলন বজায় থাকে।`;
      suggestedFollowUps.push(
        "Which rice varieties tolerate >8 dS/m salinity?",
        "Can I use gypsum or rice straw mulch?",
        "What is the risk during flowering stage?"
      );
    } else if (lowerQuery.includes("potato") || lowerQuery.includes("maize") || lowerQuery.includes("আলু") || lowerQuery.includes("ভুট্টা")) {
      referencedFactors.push("Market Cash Flow", "Pest Reservoir", "Harvest Window");
      replyEn = `Potato and Hybrid Maize offer high gross financial returns (often >৳70,000/acre). However, they extend field occupancy to 90–140 days and require heavy potash/NPK feeding. If you choose Potato, ensure you select early-maturing varieties like Cardinal or Diamant to avoid delaying the subsequent Kharif season.`;
      replyBn = `আলু ও হাইব্রিড ভুট্টা অত্যন্ত লাভজনক শস্য (একরে ৭০,০০০+ টাকা লাভ সম্ভব)। তবে এদের বৃদ্ধির সময়কাল ৯০-১৪০ দিন এবং প্রচুর সার প্রয়োজন। আলু চাষ করতে চাইলে স্বল্পমেয়াদী ডায়মন্ড বা কার্ডিনাল জাত বাছাই করুন যাতে পরবর্তী ফসল রোপণে বিলম্ব না ঘটে।`;
      suggestedFollowUps.push(
        "Compare profitability: Mustard vs Potato",
        "What are the cold storage logistics?",
        "How do I prevent late blight?"
      );
    } else {
      referencedFactors.push("AEZ Agronomic Alignment", "Soil Organic Carbon", "Profit Maximization");
      replyEn = `For ${fieldName} in ${district}, this sequence (${optimalCrop1} → ${optimalCrop2} → ${optimalCrop3}) is scientifically optimized for local seasonal climate, soil EC (${salinity} dS/m), and your chosen priorities. It maximizes your annual gross margin while revitalizing soil nitrogen and reducing irrigation vulnerability.`;
      replyBn = `${district} এর ${fieldName} এর জন্য এই শস্য বিন্যাস (${optimalCrop1Bn} → ${optimalCrop2Bn} → ${optimalCrop3Bn}) স্থানীয় আবহাওয়া, মাটির লবণাক্ততা (${salinity} dS/m) এবং আপনার পছন্দের লক্ষ্য অনুযায়ী বৈজ্ঞানিকভাবে নিখুঁত। এটি মাটির উর্বরতা রক্ষা করে আপনার বাৎসরিক আয় সর্বোচ্চ করবে।`;
      suggestedFollowUps.push(
        "How much fertilizer can I save with legumes?",
        "What are the key risks during dry spells?",
        "Can I plant hybrid maize instead?"
      );
    }

    const responsePayload: AssistantResponse = {
      replyEn,
      replyBn,
      suggestedFollowUps,
      referencedFactors,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error: any) {
    console.error("Assistant route error:", error);
    return NextResponse.json(
      { error: "Assistant error", message: error?.message },
      { status: 500 }
    );
  }
}
