import { Router } from "express";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/zod.js";
import { db } from '../db/connection.js'
import { desc } from 'drizzle-orm'; // <--- Ensure this is imported!
import { matches } from "../db/schema.js";
import { getMatchStatus } from "../utils/match-status.js";

const matchRouter = Router()
const MAX_LIMIT = 100;  


matchRouter.get("/", async(req, res)=>{
    //check how req.query works
    //req.query is used for GET requests. It pulls data directly from the URL after the question mark (?).
    const parsed = listMatchesQuerySchema.safeParse(req.query)

    console.log(req.query, parsed)

    if(!parsed.success){
        return res.status(400).json({error: 'Invalid Query'})
    }
    // Using ?? 50 for the default limit
    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT)
    console.log({limit})

    try {
        const data = await db
                .select()
                .from(matches)
                .orderBy((desc(matches.createdAt)))
                .limit(limit)

                res.status(200).json({data})
    } catch (error) {  
        console.error("Query Error:", error); // Log the real error to your terminal
        return res.status(500).json({error: 'Failed to list matches'})
    }
    // res.status(200).json({meassage: "Match List"})
})


matchRouter.post("/", async (req, res)=>{
    const parsed = createMatchSchema.safeParse(req.body)
    const { data: {startTime, endTime, homeScore, awayScore} } = parsed

    if(!parsed.success){
        return res.status(400).json({error: 'Invalid payload', details: JSON.stringify(parsed.error)})
    }

    // console.log(parsed) 
    // console.log(parsed.data)

    try{
        // Array Destructuring
        // Because a single INSERT command could technically insert multiple rows at once (a bulk insert), the database always returns results as an array of objects.

        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status : getMatchStatus(startTime, endTime)
        }).returning();
        console.log(event)

        // In standard SQL, an INSERT statement usually only returns the number of rows affected or the ID of the last inserted row.
        // The .returning() method (common in PostgreSQL and SQLite) instructs the database to send back the actual data it just saved. This is extremely useful because:


        res.status(201).json( {data: event})

    }catch(e){
        // This will print the raw Postgres error in your terminal
        console.error("RAW DATABASE ERROR:", e.originalError || e); 
        console.error("Drizzle Error Name:", e.name);
        console.error("Drizzle Error Message:", e.message);
        if (e.originalError) console.error("Original DB Error:", e.originalError.message);
    
        res.status(500).json({error: 'Failed to create match.', details: JSON.stringify(e)});
    }
})

export default matchRouter