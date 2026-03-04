import { Router } from 'express';
import { db } from '../db/connection.js'; // Your Drizzle connection
import { commentary } from '../db/schema.js'; // Your Drizzle schema definition
import { createCommentarySchema } from '../validation/commentary.js';
import { listMatchesQuerySchema, matchIdParamSchema } from '../validation/matches.js'
import { desc, eq } from 'drizzle-orm';
import { MAX_LIMIT } from './matches.js';
import { Result } from 'pg';

export const commentaryRouter = Router({ mergeParams: true })
// { mergeParams: true } allows this router to "see" parameters defined in the parent router.
// Without this, req.params.id would be undefined because the ':id' is defined 
// in the app.use('/matches/:id/commentary', ...) call, not inside this specific file.

commentaryRouter.get("/", async(req, res)=>{
    const  matchIdValidation  = matchIdParamSchema.safeParse(req.params);
    if(!matchIdValidation.success){
        console.log("failed validation")
        return res.status(400).json({error: 'Invalid matchID', details: matchId.error.issues})
    }

    const queryResult = listMatchesQuerySchema.safeParse(req.query)
    if(!queryResult.success){
        return res.status(400).json({error: 'Invalid query parameters.', details: queryResult.error.issues})
    }

    try {
        const  matchId = matchIdValidation.data.id;
        console.log(matchId)
        const {limit = 10} = queryResult.data;

        const safeLimit = Math.min(limit, MAX_LIMIT );

        const results = await db.select().from(commentary)
        .where(eq(commentary.matchId, matchId))
        .orderBy(desc(commentary.createdAt))
        .limit(safeLimit)
         console.log("query running", results)

        res.status(200).json({data: results})
    } catch (e) {
      console.log('Failed to fetch commentary:', e)
      res.status(500).json({message: "Failed to fetch commentary."})
    }
})

commentaryRouter.post('/', async (req, res) => {
    
  try { 
    console.log("Is schema valid?:", !!matchIdParamSchema?.safeParse);

    // 1. Validate URL Parameters
    const  matchIdValidation  = matchIdParamSchema.safeParse(req.params);
     console.log("commentaryRouter.",matchId )   
    if(!matchIdValidation.success){
        console.log("failed validation")
        return res.status(400).json({error: 'Invalid matchID', details: matchId.error.issues})
    }
   
    // 2. Validate Request Body 
    const validatedData = createCommentarySchema.safeParse(req.body);
    if(!validatedData.success){
        return res.status(400).json({error: 'Invalid commentary payload.', details: validatedData.error.issues})
    }
    console.log({matchId: matchIdValidation.data.id, ...validatedData.data})
    // 3. Insert into Database
    // We spread the validated data and inject the matchId from the URL
    const [insertedCommentary] = await db.insert(commentary).values({
        matchId: matchIdValidation.data.id,
        ...validatedData.data,
      }).returning(); // Returns the inserted row (Postgres/SQLite)

      if(res.app.locals.broadcastComentary){
        res.app.locals.broadcastCommentary(insertedCommentary.matchId, insertedCommentary)
      }

    // 4. Return Result
    return res.status(201).json({
      success: true,
      data: insertedCommentary,
    });

  } catch (error) {
    // Handle Database or unexpected errors
    console.error('[Commentary Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create commentary.',
    })
  }
})
