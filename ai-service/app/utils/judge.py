import math

def judge(left: float, right: float, exercise: dict, session=None) -> list:
    """
    Evaluates the current joint angles (left and right shoulder) and returns corrective feedback.
    
    If `session` is provided, performs phase-based dynamic movement analysis.
    Otherwise, falls back to the static angle check.
    """
    if session is not None:
        return judge_dynamic(left, right, exercise, session)
        
    feedbacks = []
    if 'shoulder_angle' in exercise:
        sa = exercise['shoulder_angle']
        if left < sa.get('min', 0):
            feedbacks.append("Left arm: " + sa.get('feedback_low', 'Raise your arm higher.'))
        if left > sa.get('max', 180):
            feedbacks.append("Left arm: " + sa.get('feedback_high', 'Lower your arm slightly.'))
        if right < sa.get('min', 0):
            feedbacks.append("Right arm: " + sa.get('feedback_low', 'Raise your arm higher.'))
        if right > sa.get('max', 180):
            feedbacks.append("Right arm: " + sa.get('feedback_high', 'Lower your arm slightly.'))
    return feedbacks

def judge_dynamic(left: float, right: float, exercise_config: dict, session) -> list:
    # Update the session with the new raw angles
    session.update(left, right)
    
    # Get smoothed values and velocities
    smoothed_left, smoothed_right, vel_left, vel_right = session.get_smoothed_angles_and_velocities()
    
    # Retrieve phases from exercise configuration
    phases = exercise_config.get("phases", [])
    if not phases:
        return []
        
    # Find current phase index
    current_phase_index = 0
    for idx, p in enumerate(phases):
        if p["id"] == session.current_phase_id:
            current_phase_index = idx
            break
            
    current_phase = phases[current_phase_index]
    
    # Check for phase transition first
    transition = current_phase.get("transition")
    if transition:
        t_type = transition.get("type")
        t_joints = transition.get("joints", [])
        threshold = transition.get("threshold", 0)
        next_phase_id = transition.get("next_phase")
        
        joint_values = []
        for j in t_joints:
            if j == "left_shoulder":
                joint_values.append(smoothed_left)
            elif j == "right_shoulder":
                joint_values.append(smoothed_right)
                
        transition_triggered = False
        if joint_values:
            if t_type == "any_above" and any(v >= threshold for v in joint_values):
                transition_triggered = True
            elif t_type == "both_above" and all(v >= threshold for v in joint_values):
                transition_triggered = True
            elif t_type == "any_below" and any(v <= threshold for v in joint_values):
                transition_triggered = True
            elif t_type == "both_below" and all(v <= threshold for v in joint_values):
                transition_triggered = True
                
        if transition_triggered and next_phase_id:
            session.current_phase_id = next_phase_id
            # Re-fetch current phase configuration
            for p in phases:
                if p["id"] == next_phase_id:
                    current_phase = p
                    break
                    
    # Evaluate constraints of the active phase
    feedbacks = []
    constraints = current_phase.get("constraints", {})
    
    # 1. Left shoulder individual constraints
    left_c = constraints.get("left_shoulder")
    if left_c:
        min_v = left_c.get("min")
        max_v = left_c.get("max")
        if min_v is not None and smoothed_left < min_v:
            fb = left_c.get("feedback_low")
            if fb: feedbacks.append(fb)
        elif max_v is not None and smoothed_left > max_v:
            fb = left_c.get("feedback_high")
            if fb: feedbacks.append(fb)
            
    # 2. Right shoulder individual constraints
    right_c = constraints.get("right_shoulder")
    if right_c:
        min_v = right_c.get("min")
        max_v = right_c.get("max")
        if min_v is not None and smoothed_right < min_v:
            fb = right_c.get("feedback_low")
            if fb: feedbacks.append(fb)
        elif max_v is not None and smoothed_right > max_v:
            fb = right_c.get("feedback_high")
            if fb: feedbacks.append(fb)
            
    # 3. Symmetry constraints
    symmetry = constraints.get("symmetry")
    if symmetry:
        max_diff = symmetry.get("max_diff", 20)
        diff = smoothed_left - smoothed_right
        if abs(diff) > max_diff:
            if diff > 0:  # Left is higher than right
                fb = symmetry.get("feedback_right_lag")
                if fb: feedbacks.append(fb)
            else:  # Right is higher than left
                fb = symmetry.get("feedback_left_lag")
                if fb: feedbacks.append(fb)
                
    # 4. Direction constraint (checks velocity)
    direction = constraints.get("direction")
    if direction:
        d_type = direction.get("type")
        fb = direction.get("feedback")
        if fb:
            if d_type == "positive" and (vel_left < -1.5 or vel_right < -1.5):
                feedbacks.append(fb)
            elif d_type == "negative" and (vel_left > 1.5 or vel_right > 1.5):
                feedbacks.append(fb)
                
    return feedbacks
