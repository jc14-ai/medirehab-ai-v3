def judge(left, right, exercise):
    feedbacks = []
    if left < exercise['shoulder_angle']['min']:
        feedbacks.append("Left arm: " + exercise['shoulder_angle']['feedback_low'])
    
    if left > exercise['shoulder_angle']['max']:
        feedbacks.append("Left arm: " + exercise['shoulder_angle']['feedback_high'])
        
    if right < exercise['shoulder_angle']['min']:
        feedbacks.append("Right arm: " + exercise['shoulder_angle']['feedback_low'])
    
    if right > exercise['shoulder_angle']['max']:
        feedbacks.append("Right arm: " + exercise['shoulder_angle']['feedback_high'])
        
    return feedbacks
