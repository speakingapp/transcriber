const fs = require('fs')
const {Telegraf} = require('telegraf')
const { Deepgram } = require("@deepgram/sdk");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: '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', // defaults to process.env["OPENAI_API_KEY"]
});



const deepgram = new Deepgram('7e152e9866bbc69d6487e1bea4b6c250aeeab7ca');
const BOT_TOKEN ='6124695087:AAG0NprnUOPuxyaHA_79ZDazy870_007Dtk'
const bot = new Telegraf(BOT_TOKEN)
bot.on('audio', async (ctx)=>{
	const fileId= ctx.message.audio.file_id
	const file = await ctx.telegram.getFile(fileId);
	const audioUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

 
  const response = await deepgram.transcription.preRecorded(
  { url: audioUrl },
  {punctuate: true}  
);
  const text=response.results.channels[0].alternatives[0].transcript
  const completion = await openai.completions.create({
    model: "gpt-3.5-turbo-instruct",
    prompt: `check the following IELTS speaking transcript result and assess it in terms of grammar, lexical resources and fluency and prononciation:${text}. You should follow this structure: "Feedback":feedback, "Lexical Resources": lexical resources, "Grammar": grammar, "Fluency": fluency,"Pronunciation":pronunciation, "Overall Score": score/75 `,
    max_tokens: 800,
    temperature: 0,
  });

  ctx.replyWithHTML("<b>OverallScore</b> "+completion.choices[0].text);
})


bot.launch()