"""
The DukeBox of London API Backend Tests
Tests for: health, phases, genres, conduct, history, stats endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_returns_ok(self):
        """Test /api/health returns ok status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "dukebox-api"
        print(f"✓ Health check passed: {data}")


class TestPhasesEndpoint:
    """Phases endpoint tests"""
    
    def test_phases_returns_4_phases(self):
        """Test /api/phases returns exactly 4 phases"""
        response = requests.get(f"{BASE_URL}/api/phases")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 4, f"Expected 4 phases, got {len(data)}"
        
        # Verify phase structure
        for phase in data:
            assert "code" in phase
            assert "name" in phase
            assert "vibe" in phase
            assert "color" in phase
            assert "bpm_range" in phase
            assert len(phase["bpm_range"]) == 2
        
        # Verify phase codes
        codes = [p["code"] for p in data]
        assert sorted(codes) == [1, 2, 3, 4], f"Expected codes [1,2,3,4], got {codes}"
        print(f"✓ Phases endpoint returned {len(data)} phases with correct structure")


class TestGenresEndpoint:
    """Genres endpoint tests"""
    
    def test_genres_returns_51_genres(self):
        """Test /api/genres returns 51 genres"""
        response = requests.get(f"{BASE_URL}/api/genres")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 51, f"Expected 51 genres, got {len(data)}"
        
        # Verify genre structure
        for genre in data:
            assert "code" in genre
            assert "name" in genre
            assert "phase" in genre
            assert "bpm" in genre
            assert len(genre["bpm"]) == 2
        print(f"✓ Genres endpoint returned {len(data)} genres")
    
    def test_genres_filter_by_phase_1(self):
        """Test /api/genres?phase=1 returns only Phase 1 genres"""
        response = requests.get(f"{BASE_URL}/api/genres?phase=1")
        assert response.status_code == 200
        data = response.json()
        
        # All genres should be phase 1
        for genre in data:
            assert genre["phase"] == 1, f"Genre {genre['code']} has phase {genre['phase']}, expected 1"
        
        # Phase 1 should have 13 genres (B-01 to B-13)
        assert len(data) == 13, f"Expected 13 Phase 1 genres, got {len(data)}"
        print(f"✓ Phase 1 filter returned {len(data)} genres, all with phase=1")
    
    def test_genres_filter_by_phase_2(self):
        """Test /api/genres?phase=2 returns only Phase 2 genres"""
        response = requests.get(f"{BASE_URL}/api/genres?phase=2")
        assert response.status_code == 200
        data = response.json()
        
        for genre in data:
            assert genre["phase"] == 2
        assert len(data) == 13, f"Expected 13 Phase 2 genres, got {len(data)}"
        print(f"✓ Phase 2 filter returned {len(data)} genres")
    
    def test_genres_filter_by_phase_3(self):
        """Test /api/genres?phase=3 returns only Phase 3 genres"""
        response = requests.get(f"{BASE_URL}/api/genres?phase=3")
        assert response.status_code == 200
        data = response.json()
        
        for genre in data:
            assert genre["phase"] == 3
        assert len(data) == 10, f"Expected 10 Phase 3 genres, got {len(data)}"
        print(f"✓ Phase 3 filter returned {len(data)} genres")
    
    def test_genres_filter_by_phase_4(self):
        """Test /api/genres?phase=4 returns only Phase 4 genres"""
        response = requests.get(f"{BASE_URL}/api/genres?phase=4")
        assert response.status_code == 200
        data = response.json()
        
        for genre in data:
            assert genre["phase"] == 4
        assert len(data) == 15, f"Expected 15 Phase 4 genres, got {len(data)}"
        print(f"✓ Phase 4 filter returned {len(data)} genres")
    
    def test_genre_by_code(self):
        """Test /api/genres/{code} returns specific genre"""
        response = requests.get(f"{BASE_URL}/api/genres/B-01")
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == "B-01"
        assert data["name"] == "Peak Hour Techno"
        assert data["phase"] == 1
        print(f"✓ Genre by code returned: {data['name']}")


class TestConductEndpoint:
    """Conduct endpoint tests - MOCKED AI generation"""
    
    def test_conduct_with_phase_atmosphere_bpm(self):
        """Test /api/conduct with phase/atmosphere/bpm returns track with waveform"""
        payload = {
            "phase": 1,
            "atmosphere": "dark",
            "bpm": 150
        }
        response = requests.post(f"{BASE_URL}/api/conduct", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify track structure
        assert "track_id" in data
        assert "name" in data
        assert "genre" in data
        assert "phase" in data
        assert "bpm" in data
        assert "atmosphere" in data
        assert "waveform" in data
        assert "duration_s" in data
        assert "cost_per_hour" in data
        assert "created_at" in data
        assert "seed" in data
        
        # Verify waveform data
        assert isinstance(data["waveform"], list)
        assert len(data["waveform"]) == 64, f"Expected 64 waveform points, got {len(data['waveform'])}"
        
        # Verify values match request
        assert data["phase"] == 1
        assert data["atmosphere"] == "dark"
        assert data["bpm"] == 150
        
        print(f"✓ Conduct returned track: {data['name']} with {len(data['waveform'])} waveform points")
        return data["track_id"]
    
    def test_conduct_with_surprise_me(self):
        """Test /api/conduct with surprise_me=true randomizes parameters"""
        payload = {
            "phase": 2,
            "surprise_me": True
        }
        response = requests.post(f"{BASE_URL}/api/conduct", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify track was generated
        assert "track_id" in data
        assert "bpm" in data
        assert "atmosphere" in data
        
        # BPM should be within phase 2 range (120-140)
        assert 120 <= data["bpm"] <= 140, f"BPM {data['bpm']} not in Phase 2 range [120-140]"
        
        # Atmosphere should be one of the valid options
        assert data["atmosphere"] in ["dark", "balanced", "uplifting"]
        
        print(f"✓ Surprise me returned: BPM={data['bpm']}, atmosphere={data['atmosphere']}")
    
    def test_conduct_invalid_phase(self):
        """Test /api/conduct with invalid phase returns 400"""
        payload = {
            "phase": 99,
            "atmosphere": "balanced",
            "bpm": 128
        }
        response = requests.post(f"{BASE_URL}/api/conduct", json=payload)
        assert response.status_code == 400
        print("✓ Invalid phase correctly returns 400")


class TestHistoryEndpoint:
    """History endpoint tests"""
    
    def test_history_returns_tracks(self):
        """Test /api/history returns generated tracks"""
        response = requests.get(f"{BASE_URL}/api/history")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        
        # If there are tracks, verify structure
        if len(data) > 0:
            track = data[0]
            assert "track_id" in track
            assert "name" in track
            assert "phase" in track
            assert "bpm" in track
            assert "created_at" in track
        
        print(f"✓ History returned {len(data)} tracks")
    
    def test_history_action_love(self):
        """Test /api/history/action with love action updates track"""
        # First create a track
        conduct_response = requests.post(f"{BASE_URL}/api/conduct", json={
            "phase": 1,
            "atmosphere": "balanced",
            "bpm": 145
        })
        assert conduct_response.status_code == 200
        track_id = conduct_response.json()["track_id"]
        
        # Now love the track
        action_payload = {
            "session_id": "test_session",
            "track_id": track_id,
            "action": "love"
        }
        response = requests.post(f"{BASE_URL}/api/history/action", json=action_payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "ok"
        assert data["action"] == "love"
        assert data["track_id"] == track_id
        
        # Verify track is now loved in history
        history_response = requests.get(f"{BASE_URL}/api/history")
        tracks = history_response.json()
        loved_track = next((t for t in tracks if t["track_id"] == track_id), None)
        assert loved_track is not None
        assert loved_track.get("loved") is True
        
        print(f"✓ Love action worked for track {track_id}")
    
    def test_history_action_pin(self):
        """Test /api/history/action with pin action updates track"""
        # First create a track
        conduct_response = requests.post(f"{BASE_URL}/api/conduct", json={
            "phase": 2,
            "atmosphere": "uplifting",
            "bpm": 128
        })
        assert conduct_response.status_code == 200
        track_id = conduct_response.json()["track_id"]
        
        # Now pin the track
        action_payload = {
            "session_id": "test_session",
            "track_id": track_id,
            "action": "pin"
        }
        response = requests.post(f"{BASE_URL}/api/history/action", json=action_payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "ok"
        assert data["action"] == "pin"
        
        # Verify track is now pinned in history
        history_response = requests.get(f"{BASE_URL}/api/history")
        tracks = history_response.json()
        pinned_track = next((t for t in tracks if t["track_id"] == track_id), None)
        assert pinned_track is not None
        assert pinned_track.get("pinned") is True
        
        print(f"✓ Pin action worked for track {track_id}")
    
    def test_history_action_nonexistent_track(self):
        """Test /api/history/action with nonexistent track returns 404"""
        action_payload = {
            "session_id": "test_session",
            "track_id": "nonexistent-track-id",
            "action": "love"
        }
        response = requests.post(f"{BASE_URL}/api/history/action", json=action_payload)
        assert response.status_code == 404
        print("✓ Action on nonexistent track correctly returns 404")


class TestStatsEndpoint:
    """Stats endpoint tests"""
    
    def test_stats_returns_correct_structure(self):
        """Test /api/stats returns stats with correct structure"""
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "total_tracks" in data
        assert "loved" in data
        assert "pinned" in data
        assert "phase_counts" in data
        assert "session_cost" in data
        
        # Verify phase_counts has all 4 phases
        assert "1" in data["phase_counts"]
        assert "2" in data["phase_counts"]
        assert "3" in data["phase_counts"]
        assert "4" in data["phase_counts"]
        
        # Verify types
        assert isinstance(data["total_tracks"], int)
        assert isinstance(data["loved"], int)
        assert isinstance(data["pinned"], int)
        assert isinstance(data["session_cost"], (int, float))
        
        print(f"✓ Stats returned: total={data['total_tracks']}, loved={data['loved']}, pinned={data['pinned']}, cost=${data['session_cost']}")


class TestTransitionEndpoint:
    """Transition endpoint tests - Smart Mixer bridge track generation"""
    
    def test_transition_creates_bridge_track(self):
        """Test POST /api/transition creates a transition bridge track"""
        payload = {
            "from_phase": 1,
            "to_phase": 2,
            "crossfade_pct": 50.0,
            "atmosphere": "balanced"
        }
        response = requests.post(f"{BASE_URL}/api/transition", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify transition track structure
        assert "track_id" in data
        assert "name" in data
        assert "from_phase" in data
        assert "to_phase" in data
        assert "crossfade_pct" in data
        assert "bpm" in data
        assert "from_genre" in data
        assert "to_genre" in data
        assert "waveform" in data
        assert "transition" in data
        assert data["transition"] is True
        
        # Verify values match request
        assert data["from_phase"] == 1
        assert data["to_phase"] == 2
        assert data["crossfade_pct"] == 50.0
        assert data["atmosphere"] == "balanced"
        
        # Verify blended BPM is calculated (between phase 1 and 2 midpoints)
        # Phase 1: 140-180 (mid=160), Phase 2: 120-140 (mid=130)
        # At 50% crossfade, blended BPM should be around 145
        assert 120 <= data["bpm"] <= 180, f"BPM {data['bpm']} not in expected range"
        
        print(f"✓ Transition created: {data['name']} with BPM={data['bpm']}")
        return data["track_id"]
    
    def test_transition_track_appears_in_history(self):
        """Test transition track appears in /api/history"""
        # Create a transition track
        payload = {
            "from_phase": 2,
            "to_phase": 3,
            "crossfade_pct": 70.0,
            "atmosphere": "dark"
        }
        create_response = requests.post(f"{BASE_URL}/api/transition", json=payload)
        assert create_response.status_code == 200
        track_id = create_response.json()["track_id"]
        
        # Verify it appears in history
        history_response = requests.get(f"{BASE_URL}/api/history")
        assert history_response.status_code == 200
        tracks = history_response.json()
        
        transition_track = next((t for t in tracks if t["track_id"] == track_id), None)
        assert transition_track is not None, f"Transition track {track_id} not found in history"
        assert transition_track.get("transition") is True
        assert transition_track["from_phase"] == 2
        assert transition_track["to_phase"] == 3
        
        print(f"✓ Transition track {track_id} found in history")
    
    def test_transition_blended_bpm_calculation(self):
        """Test blended BPM is correctly calculated based on crossfade percentage"""
        # At 0% crossfade, BPM should be closer to from_phase
        payload_0 = {"from_phase": 1, "to_phase": 4, "crossfade_pct": 0.0}
        response_0 = requests.post(f"{BASE_URL}/api/transition", json=payload_0)
        assert response_0.status_code == 200
        bpm_0 = response_0.json()["bpm"]
        
        # At 100% crossfade, BPM should be closer to to_phase
        payload_100 = {"from_phase": 1, "to_phase": 4, "crossfade_pct": 100.0}
        response_100 = requests.post(f"{BASE_URL}/api/transition", json=payload_100)
        assert response_100.status_code == 200
        bpm_100 = response_100.json()["bpm"]
        
        # Phase 1 mid BPM ~160, Phase 4 mid BPM ~80
        # At 0% crossfade, BPM should be ~160
        # At 100% crossfade, BPM should be ~80
        assert bpm_0 > bpm_100, f"BPM at 0% ({bpm_0}) should be > BPM at 100% ({bpm_100})"
        
        print(f"✓ Blended BPM: 0%={bpm_0}, 100%={bpm_100}")
    
    def test_transition_invalid_phase(self):
        """Test /api/transition with invalid phase returns 400"""
        payload = {"from_phase": 99, "to_phase": 2, "crossfade_pct": 50.0}
        response = requests.post(f"{BASE_URL}/api/transition", json=payload)
        assert response.status_code == 400
        print("✓ Invalid phase correctly returns 400")


class TestArtistAndLondonSeeds:
    """Artist seeds and London seeds endpoint tests"""
    
    def test_artist_seeds(self):
        """Test /api/artist-seeds returns artist seeds"""
        response = requests.get(f"{BASE_URL}/api/artist-seeds")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) == 3
        
        for seed in data:
            assert "id" in seed
            assert "name" in seed
            assert "artists" in seed
        
        print(f"✓ Artist seeds returned {len(data)} seeds")
    
    def test_london_seeds(self):
        """Test /api/london-seeds returns London seeds"""
        response = requests.get(f"{BASE_URL}/api/london-seeds")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) == 3
        
        for seed in data:
            assert "id" in seed
            assert "name" in seed
            assert "era" in seed
            assert "traits" in seed
        
        print(f"✓ London seeds returned {len(data)} seeds")


class TestVibeLinkEndpoints:
    """Vibe Link sharing endpoints tests - Iteration 8 feature"""
    
    def test_create_vibe_link_returns_6_char_code(self):
        """Test POST /api/vibe-link creates a vibe link with 6-char code"""
        payload = {
            "phase": 1,
            "atmosphere": "dark",
            "bpm": 150,
            "genre_code": "B-01",
            "name": "TEST_Vibe Link Track"
        }
        response = requests.post(f"{BASE_URL}/api/vibe-link", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "code" in data
        assert "url" in data
        
        # Verify code is 6 characters uppercase
        assert len(data["code"]) == 6, f"Expected 6-char code, got {len(data['code'])}"
        assert data["code"].isupper(), f"Code should be uppercase: {data['code']}"
        
        # Verify URL format
        assert data["url"] == f"/vibe/{data['code']}"
        
        print(f"✓ Vibe link created with code: {data['code']}")
        return data["code"]
    
    def test_create_vibe_link_stores_all_params(self):
        """Test POST /api/vibe-link stores phase, atmosphere, bpm, genre_code, name"""
        payload = {
            "track_id": "test-track-123",
            "phase": 2,
            "atmosphere": "balanced",
            "bpm": 128,
            "genre_code": "H-13",
            "vocal_style": "female",
            "artist_seed": "architect",
            "name": "TEST_Deep House Vibe"
        }
        response = requests.post(f"{BASE_URL}/api/vibe-link", json=payload)
        assert response.status_code == 200
        code = response.json()["code"]
        
        # Retrieve and verify all params are stored
        get_response = requests.get(f"{BASE_URL}/api/vibe-link/{code}")
        assert get_response.status_code == 200
        data = get_response.json()
        
        assert data["track_id"] == "test-track-123"
        assert data["phase"] == 2
        assert data["atmosphere"] == "balanced"
        assert data["bpm"] == 128
        assert data["genre_code"] == "H-13"
        assert data["vocal_style"] == "female"
        assert data["artist_seed"] == "architect"
        assert data["name"] == "TEST_Deep House Vibe"
        assert "created_at" in data
        assert "opens" in data
        
        print(f"✓ Vibe link stores all params correctly")
    
    def test_get_vibe_link_retrieves_params(self):
        """Test GET /api/vibe-link/{code} retrieves stored params"""
        # Create a vibe link first
        payload = {
            "phase": 3,
            "atmosphere": "uplifting",
            "bpm": 120,
            "genre_code": "O-26",
            "name": "TEST_Organic House Vibe"
        }
        create_response = requests.post(f"{BASE_URL}/api/vibe-link", json=payload)
        assert create_response.status_code == 200
        code = create_response.json()["code"]
        
        # Retrieve the vibe link
        get_response = requests.get(f"{BASE_URL}/api/vibe-link/{code}")
        assert get_response.status_code == 200
        data = get_response.json()
        
        # Verify structure
        assert data["code"] == code
        assert data["phase"] == 3
        assert data["atmosphere"] == "uplifting"
        assert data["bpm"] == 120
        assert data["genre_code"] == "O-26"
        assert data["name"] == "TEST_Organic House Vibe"
        
        print(f"✓ GET /api/vibe-link/{code} retrieves params correctly")
    
    def test_get_vibe_link_increments_opens_counter(self):
        """Test GET /api/vibe-link/{code} increments opens counter"""
        # Create a vibe link
        payload = {"phase": 4, "atmosphere": "dark", "bpm": 80, "name": "TEST_Counter Track"}
        create_response = requests.post(f"{BASE_URL}/api/vibe-link", json=payload)
        assert create_response.status_code == 200
        code = create_response.json()["code"]
        
        # First GET - opens should be 0 initially, then incremented to 1
        get1 = requests.get(f"{BASE_URL}/api/vibe-link/{code}")
        assert get1.status_code == 200
        opens1 = get1.json()["opens"]
        
        # Second GET - opens should increment
        get2 = requests.get(f"{BASE_URL}/api/vibe-link/{code}")
        assert get2.status_code == 200
        opens2 = get2.json()["opens"]
        
        # Third GET - opens should increment again
        get3 = requests.get(f"{BASE_URL}/api/vibe-link/{code}")
        assert get3.status_code == 200
        opens3 = get3.json()["opens"]
        
        # Verify increments (opens is incremented AFTER returning, so we see 0, 1, 2)
        assert opens2 == opens1 + 1, f"Opens should increment: {opens1} -> {opens2}"
        assert opens3 == opens2 + 1, f"Opens should increment: {opens2} -> {opens3}"
        
        print(f"✓ Opens counter increments: {opens1} -> {opens2} -> {opens3}")
    
    def test_get_vibe_link_invalid_code_returns_404(self):
        """Test GET /api/vibe-link/INVALID returns 404"""
        response = requests.get(f"{BASE_URL}/api/vibe-link/INVALID")
        assert response.status_code == 404
        
        # Also test lowercase (should still be 404 since code is uppercased)
        response2 = requests.get(f"{BASE_URL}/api/vibe-link/xxxxxx")
        assert response2.status_code == 404
        
        print("✓ Invalid vibe link code correctly returns 404")
    
    def test_get_vibe_link_case_insensitive(self):
        """Test GET /api/vibe-link/{code} is case-insensitive"""
        # Create a vibe link
        payload = {"phase": 1, "atmosphere": "balanced", "bpm": 145, "name": "TEST_Case Test"}
        create_response = requests.post(f"{BASE_URL}/api/vibe-link", json=payload)
        assert create_response.status_code == 200
        code = create_response.json()["code"]
        
        # Try lowercase
        get_lower = requests.get(f"{BASE_URL}/api/vibe-link/{code.lower()}")
        assert get_lower.status_code == 200
        assert get_lower.json()["code"] == code
        
        print(f"✓ Vibe link retrieval is case-insensitive")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
