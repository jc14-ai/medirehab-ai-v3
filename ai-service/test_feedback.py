import sys
import os
# Add current directory to path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.utils.exercise_config import get_exercise_config
from app.utils.session_manager import session_manager
from app.utils.judge import judge

def feed_frames(session, config, left, right, num=5):
    fbs = []
    for _ in range(num):
        fbs = judge(left, right, config, session=session)
    return fbs

def run_test():
    print("Starting feedback system test...")
    
    exercise_id = "shoulder_flexion"
    session_id = "test_session_123"
    
    config = get_exercise_config(exercise_id)
    assert config is not None, "Failed to load exercise config"
    print(f"Loaded config: {config['name']}")
    
    # Initialize session
    session = session_manager.get_or_create_session(session_id, exercise_id)
    
    # Simulate movement sequence:
    # 1. Starting Position (angles around 10 deg)
    print("\n--- Phase: START ---")
    feedbacks = feed_frames(session, config, 10.0, 10.0, num=5)
    print(f"Angle: (10, 10) | Phase: {session.current_phase_id} | Feedbacks: {feedbacks}")
    assert not feedbacks, "Should not generate feedback in starting position with correct alignment"
        
    # 2. Starting Position with deviation (Left arm too high)
    feedbacks = feed_frames(session, config, 35.0, 10.0, num=5)
    print(f"Angle: (35, 10) | Phase: {session.current_phase_id} | Feedbacks: {feedbacks}")
    
    # 3. Transition to ASCENT (both arms rising)
    print("\n--- Phase: ASCENT ---")
    # Clean recreate to start fresh
    session = session_manager.get_or_create_session(session_id, exercise_id)
    session.current_phase_id = "START"
    session.history = {"left_shoulder": [], "right_shoulder": []}
    
    # Advance to ASCENT by raising above 30 degrees
    feedbacks = feed_frames(session, config, 35.0, 35.0, num=5)
    print(f"Angle: (35, 35) | Phase: {session.current_phase_id} | Feedbacks: {feedbacks}")
    assert session.current_phase_id == "ASCENT", "Should transition to ASCENT phase"
    
    # Raise smoothly with symmetry
    for angle in [45, 55, 65, 75]:
        feedbacks = feed_frames(session, config, float(angle), float(angle), num=5)
        print(f"Angle: ({angle}, {angle}) | Phase: {session.current_phase_id} | Feedbacks: {feedbacks}")
        assert not feedbacks, "Symmetric raising should not trigger feedback"
        
    # Raise with asymmetry (left lagging)
    feedbacks = feed_frames(session, config, 50.0, 75.0, num=5)
    print(f"Angle: (50, 75) | Phase: {session.current_phase_id} | Feedbacks: {feedbacks}")
    assert "Raise your left arm higher." in feedbacks, "Should flag asymmetry (left lagging)"

    # 4. Transition to PEAK (reaching >= 80 deg)
    print("\n--- Phase: PEAK ---")
    feedbacks = feed_frames(session, config, 85.0, 85.0, num=5)
    print(f"Angle: (85, 85) | Phase: {session.current_phase_id} | Feedbacks: {feedbacks}")
    assert session.current_phase_id == "PEAK", "Should transition to PEAK phase"
    
    # In PEAK, if too low:
    feedbacks = feed_frames(session, config, 70.0, 90.0, num=5)
    print(f"Angle: (70, 90) | Phase: {session.current_phase_id} | Feedbacks: {feedbacks}")
    assert "Raise your left arm higher." in feedbacks, "Should flag left arm too low in PEAK"
    
    # 5. Transition to DESCENT (dropping below 75 deg)
    print("\n--- Phase: DESCENT ---")
    feedbacks = feed_frames(session, config, 70.0, 70.0, num=5)
    print(f"Angle: (70, 70) | Phase: {session.current_phase_id} | Feedbacks: {feedbacks}")
    assert session.current_phase_id == "DESCENT", "Should transition to DESCENT phase"
    
    # Lowering smoothly
    for angle in [60, 50, 40]:
        feedbacks = feed_frames(session, config, float(angle), float(angle), num=5)
        print(f"Angle: ({angle}, {angle}) | Phase: {session.current_phase_id} | Feedbacks: {feedbacks}")
        
    # Transition to START (dropping below 25 deg)
    feedbacks = feed_frames(session, config, 20.0, 20.0, num=5)
    print(f"Angle: (20, 20) | Phase: {session.current_phase_id} | Feedbacks: {feedbacks}")
    assert session.current_phase_id == "START", "Should transition back to START phase"

    print("\nAll tests passed successfully!")

if __name__ == "__main__":
    run_test()
