import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import dotenv from "dotenv";

dotenv.config();
process.env.NODE_OPTIONS = "--dns-result-order=ipv4first";

// Factory function to create new IMAP client
function createClient() {
  return new ImapFlow({
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT),
    secure: true,
    auth: {
      user: process.env.IMAP_USER,
      pass: process.env.IMAP_PASS,
    },
    logger: false,
  });
}

// Retry connection helper (creates a new client each attempt)
async function connectWithRetry(retries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const client = createClient();

    try {
      console.log(`Connecting to IMAP (attempt ${attempt}/${retries})...`);
      await client.connect();
      console.log("Connected successfully!");
      
return client; // Return the connected client
    } catch (err) {
      console.warn(`IMAP connect failed (attempt ${attempt}): ${err.message}`);
      await client.logout().catch(() => {});

      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        throw new Error("IMAP connection failed after retries");
      }
    }
  }
}

export default async function fetchEmails() {
  let client;

  try {
    client = await connectWithRetry();

    const lock = await client.getMailboxLock("INBOX");

    try {
      for await (const message of client.fetch("1:*", { source: true, envelope: true })) {
        const parsed = await simpleParser(message.source);

        console.log("FROM:", parsed.from?.text);
        console.log("TO:", parsed.to?.text);
        console.log("SUBJECT:", parsed.subject);
        console.log("DATE:", parsed.date);
        console.log("------------------------");
      }
    } finally {
      lock.release();
    }
  } catch (err) {
    console.error("Error in fetchEmails:", err);
    process.exit(1);
  } finally {
    if (client) await client.logout().catch(() => {});
  }
}

// Run directly from CLI
if (require.main === module) {
  fetchEmails();
}
