import axios from "axios";
import { safe } from "zerotry";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { Document } from "langchain/document";
import * as cheerio from "cheerio";

// Static mapping based on the actual Cisco documentation structure
const getCommandUrls = (): { [key: string]: string } => {
  const baseUrl = "https://www.cisco.com";

  return {
    a: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_011000.html`,
    b: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_010.html`,
    c: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_011.html`,
    d: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_0100.html`,
    e: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_0101.html`,
    f: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_0110.html`,
    g: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_0111.html`,
    h: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_01000.html`,
    i: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_01001.html`,
    k: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_01010.html`,
    l: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_01011.html`,
    m: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_01100.html`,
    n: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_01101.html`,
    o: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_01110.html`,
    p: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_01111.html`,
    q: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_010000.html`,
    r: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_010001.html`,
    s: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_010010.html`,
    t: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_010011.html`,
    u: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_010100.html`,
    v: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_010101.html`,
    w: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_010110.html`,
    x: `${baseUrl}/c/en/us/td/docs/switches/datacenter/nexus9000/sw/7-x/command_references/show_commands/b_Using_Show_Commands/b_Using_Show_Commands_chapter_010111.html`,
  };
};

// Function to determine the correct documentation page based on the command
const getCiscoDocUrl = (message: string): string => {
  const urls = getCommandUrls();
  const lowerMessage = message.toLowerCase().trim();

  let targetChar = "";

  // Extract the first character of the command
  if (lowerMessage.startsWith("show ")) {
    const commandPart = lowerMessage.substring(5).trim(); // Remove "show "
    targetChar = commandPart.charAt(0);
  } else {
    // If doesn't start with "show", use first character of message
    targetChar = lowerMessage.charAt(0);
  }

  // Look up the URL for this character
  const targetUrl = urls[targetChar];

  if (targetUrl) {
    console.log(
      `Found specific URL for character '${targetChar}': ${targetUrl}`
    );
    return targetUrl;
  }

  // Fallback to 'a' commands if character not found
  console.log(
    `No specific URL found for '${targetChar}', using A commands as fallback`
  );
  return urls["a"];
};

// Enhanced function to structure the AI response
const structureResponse = (
  rawAnswer: string,
  command: string
): Record<string, unknown> => {
  // Try to extract command syntax and description
  const lines = rawAnswer.split("\n").filter((line) => line.trim());

  let syntax = "";
  let description = "";
  const parameters: string[] = [];
  const examples: string[] = [];
  const notes: string[] = [];

  let currentSection = "description";

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.includes("Syntax:") || trimmedLine.includes("Command:")) {
      currentSection = "syntax";
      continue;
    } else if (
      trimmedLine.includes("Parameter") ||
      trimmedLine.includes("Option")
    ) {
      currentSection = "parameters";
      continue;
    } else if (
      trimmedLine.includes("Example") ||
      trimmedLine.includes("Usage:")
    ) {
      currentSection = "examples";
      continue;
    } else if (
      trimmedLine.includes("Note") ||
      trimmedLine.includes("Important")
    ) {
      currentSection = "notes";
      continue;
    }

    // Extract content based on current section
    if (trimmedLine) {
      switch (currentSection) {
        case "syntax":
          if (
            !syntax &&
            (trimmedLine.includes("show ") || trimmedLine.includes("(config)"))
          ) {
            syntax = trimmedLine;
          }
          break;
        case "parameters":
          if (
            trimmedLine.includes("•") ||
            trimmedLine.includes("-") ||
            trimmedLine.includes("|")
          ) {
            parameters.push(trimmedLine);
          }
          break;
        case "examples":
          if (
            trimmedLine.includes("show ") ||
            trimmedLine.includes("#") ||
            trimmedLine.includes("$")
          ) {
            examples.push(trimmedLine);
          }
          break;
        case "notes":
          notes.push(trimmedLine);
          break;
        default:
          description += trimmedLine + " ";
      }
    }
  }

  return {
    command: command,
    syntax: syntax || `${command}`,
    description: description.trim() || rawAnswer,
    parameters: parameters.slice(0, 5), // Limit to top 5 parameters
    examples: examples.slice(0, 3), // Limit to top 3 examples
    notes: notes.slice(0, 2), // Limit to top 2 notes
    fullResponse: rawAnswer,
  };
};

// Function to determine if the message is asking about Cisco commands
const isCiscoCommandQuery = (message: string): boolean => {
  const lowerMessage = message.toLowerCase().trim();

  // Check for explicit Cisco command patterns
  const ciscoPatterns = [
    /^show\s+/, // Starts with "show "
    /cisco/, // Contains "cisco"
    /nx-?os/, // Contains "nxos" or "nx-os"
    /nexus/, // Contains "nexus"
    /^(configure|config)\s+/, // Configuration commands
    /^(interface|int)\s+/, // Interface commands
    /^(vlan|route|bgp|ospf|eigrp)\s+/, // Network protocols
    /command/, // Contains "command"
    /switch/, // Contains "switch"
    /router/, // Contains "router"
    /what\s+is\s+show\s+/, // "what is show ..."
    /how\s+to\s+show\s+/, // "how to show ..."
    /explain\s+show\s+/, // "explain show ..."
  ];

  // Check for greeting patterns (should NOT be treated as Cisco queries)
  const greetingPatterns = [
    /^(hi|hello|hey|good\s+(morning|afternoon|evening)|greetings)/,
    /^(how\s+are\s+you|what's\s+up|sup)/,
    /^(thank\s+you|thanks|bye|goodbye)/,
    /^(yes|no|ok|okay|sure)$/,
  ];

  // Check for general conversation patterns
  const generalPatterns = [
    /^(what\s+is\s+your\s+name|who\s+are\s+you)/,
    /^(what\s+can\s+you\s+do|help\s+me)/,
    /^(tell\s+me\s+about|explain\s+(?!show))/,
    /weather/,
    /time/,
    /date/,
  ];

  // If it's a greeting or general conversation, return false
  if (
    greetingPatterns.some((pattern) => pattern.test(lowerMessage)) ||
    generalPatterns.some((pattern) => pattern.test(lowerMessage))
  ) {
    return false;
  }

  // If it matches Cisco patterns, return true
  return ciscoPatterns.some((pattern) => pattern.test(lowerMessage));
};

// Function to generate a general AI response (non-Cisco)
const generateGeneralResponse = async (message: string): Promise<string> => {
  const llm = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0.7, // Slightly higher temperature for conversational responses
  });

  const prompt = ChatPromptTemplate.fromTemplate(`
You are a helpful AI assistant specializing in Cisco networking, but you can also handle general conversations.

The user said: {input}

Instructions:
- If this is a greeting, respond warmly and mention your Cisco expertise
- If this is a general question, answer helpfully but also mention you specialize in Cisco NX-OS commands
- If this seems unrelated to networking, answer appropriately but offer to help with Cisco commands
- Keep responses friendly, concise, and professional
- Always end by asking if they need help with any Cisco show commands

Answer:
`);

  const response = await llm.invoke([await prompt.format({ input: message })]);

  return response.content as string;
};

export const POST = async (req: Request) => {
  const { message }: { message: string } = await req.json();

  // Step 1: Analyze the message context to determine if it's a Cisco command query
  const isCiscoQuery = isCiscoCommandQuery(message);

  if (!isCiscoQuery) {
    // Handle general conversation
    try {
      const generalResponse = await generateGeneralResponse(message);

      return new Response(
        JSON.stringify({
          success: true,
          type: "general",
          data: {
            answer: generalResponse,
            metadata: {
              timestamp: new Date().toISOString(),
              queryType: "general",
            },
          },
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error generating general response:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to generate response",
          details: error instanceof Error ? error.message : String(error),
        }),
        { status: 500 }
      );
    }
  }

  // Step 2: Handle Cisco command queries
  const ciscoUrl = getCiscoDocUrl(message);

  console.log(
    `Cisco command detected. Fetching documentation from: ${ciscoUrl}`
  );

  // Step 3: Load Cisco Docs from the determined URL
  const [error, data] = await safe(
    axios.get(ciscoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    })
  );

  const html = data?.data;

  if (error || !html) {
    console.error("Error fetching Cisco docs:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch Cisco docs",
        attemptedUrl: ciscoUrl,
        details: error?.message,
      }),
      { status: 500 }
    );
  }

  // Step 4: Extract text content from HTML (remove HTML tags for better processing)
  const $ = cheerio.load(html);

  // Remove script and style elements
  $("script, style").remove();

  // Extract text content, focusing on the main content area
  const textContent =
    $(".content, .main, #main, .body, .documentation").text() ||
    $("body").text() ||
    html;

  // Step 5: Wrap processed content in a Document object
  const rawDocs = [
    new Document({
      pageContent: textContent,
      metadata: {
        source: ciscoUrl,
        command_category: message.toLowerCase().charAt(0),
      },
    }),
  ];

  // Step 6: Split into smaller chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1500,
    chunkOverlap: 300,
  });
  const docs = await splitter.splitDocuments(rawDocs);

  // Step 7: Prepare enhanced prompt + LLM
  const prompt = ChatPromptTemplate.fromTemplate(`
You are a Cisco NX-OS expert assistant providing comprehensive command documentation.

<context>
{context}
</context>

Question: {input}

Instructions:
- Provide a clear, structured response about the Cisco command
- Include the exact command syntax
- Explain the purpose and functionality
- List important parameters/options if applicable
- Provide practical examples when possible
- Add any important notes or warnings
- Format your response clearly with sections when appropriate

Structure your response as follows:
1. Brief description of what the command does
2. Command syntax (exact format)
3. Key parameters (if any)
4. Usage examples (if applicable)
5. Important notes or warnings (if any)

Answer:
`);

  const llm = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0,
  });

  const chain = await createStuffDocumentsChain({
    llm,
    prompt,
  });

  // Step 8: Run the chain with docs + user message
  try {
    const rawAnswer = await chain.invoke({
      input: message,
      context: docs,
    });

    // Step 9: Structure the response for beautiful frontend rendering
    const structuredResponse = structureResponse(rawAnswer, message);

    return new Response(
      JSON.stringify({
        success: true,
        type: "cisco_command",
        data: {
          ...structuredResponse,
          metadata: {
            sourceUrl: ciscoUrl,
            documentCount: docs.length,
            commandCategory: message.toLowerCase().charAt(0),
            timestamp: new Date().toISOString(),
            queryType: "cisco_command",
          },
        },
      }),
      { status: 200 }
    );
  } catch (chainError) {
    console.error("Error running LLM chain:", chainError);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to process with LLM",
        details:
          chainError instanceof Error ? chainError.message : String(chainError),
      }),
      { status: 500 }
    );
  }
};
