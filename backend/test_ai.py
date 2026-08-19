from app.services.ai_service import generate_response

question = "What is Python?"

answer = generate_response(question)

print(answer)