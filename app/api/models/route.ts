import { NextResponse } from "next/server";
import { getAvailableModels } from "@/lib/ollama-client";
"ollama-client"

export async function GET(){
    try{
        const models = await getAvailableModels();
        return NextResponse.json({models})
    }catch(error){
        console.error("Error al obtener los modelos: ", error);
        return NextResponse.json({error: "Error al obtener los modelos"}, {status : 500});
    }
}