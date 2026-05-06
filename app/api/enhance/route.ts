import { NextResponse } from "next/server";

type EnhanceRequest = {
  role: string;
  summary: string;
  experience: string;
};

type EnhancedResume = {
  summary: string;
  bullets: string[];
};

const fallbackVerbs = ["Delivered", "Built", "Analyzed", "Automated", "Improved"];
const weakStarts: Record<string, string> = {
  built: "Built",
  build: "Built",
  cleaned: "Cleaned and standardized",
  clean: "Cleaned and standardized",
  prepared: "Prepared",
  improved: "Improved",
  created: "Created",
  made: "Created",
  analyzed: "Analyzed"
};

function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function localEnhance({ role, summary, experience }: EnhanceRequest): EnhancedResume {
  const bullets = experience
    .split(/\n|,/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .map((item, index) => {
      const [firstWord, ...rest] = item.split(/\s+/);
      const normalizedVerb = weakStarts[firstWord.toLowerCase()];
      const base = normalizedVerb ? `${normalizedVerb} ${rest.join(" ")}` : sentenceCase(item);
      const startsWithVerb = fallbackVerbs.some((verb) => base.toLowerCase().startsWith(verb.toLowerCase()));
      const verb = startsWithVerb || normalizedVerb ? "" : `${fallbackVerbs[index % fallbackVerbs.length]} `;
      const metric = /\d|%|faster|reduced|increased|improved|automated/i.test(item)
        ? ""
        : " to improve reporting quality and decision speed";
      return `${verb}${base}${metric}.`.replace(/\.+$/, ".");
    });

  return {
    summary:
      summary.trim().length > 80
        ? summary.trim()
        : `${role || "Professional"} with strong analytical judgment, clear communication, and a track record of turning raw career details into concise, achievement-led resume stories.`,
    bullets
  };
}

export async function POST(request: Request) {
  const payload = (await request.json()) as EnhanceRequest;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(localEnhance(payload));
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are an expert resume writer. Return only strict JSON with keys summary and bullets. Make copy ATS-friendly, specific, concise, and honest. Do not invent employers, degrees, certifications, or exact metrics."
        },
        {
          role: "user",
          content: JSON.stringify(payload)
        }
      ],
      text: {
        format: {
          type: "json_object"
        }
      }
    })
  });

  if (!response.ok) {
    return NextResponse.json(localEnhance(payload));
  }

  const data = await response.json();
  const content = data.output_text;

  try {
    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json(localEnhance(payload));
  }
}
