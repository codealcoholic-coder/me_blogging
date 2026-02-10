#!/usr/bin/env python3
"""
Backend API Testing for Enhanced Data Science Blog Platform
Tests all the new features: Admin Auth, Newsletter, Comments, Upvotes, Posts
"""

import requests
import json
import uuid
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:3000/api"
ADMIN_EMAIL = "admin@blog.com"
ADMIN_PASSWORD = "admin123"

# Global variables to store test data
admin_token = None
test_post_id = None
test_post_slug = None
test_comment_id = None
test_visitor_id = str(uuid.uuid4())

def log_test(test_name, success, details=""):
    """Log test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"   Details: {details}")
    print()

def make_request(method, endpoint, data=None, headers=None, expected_status=200):
    """Make HTTP request with error handling"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, timeout=10)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=10)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=headers, timeout=10)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers, timeout=10)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        print(f"Request: {method} {url}")
        print(f"Status: {response.status_code}")
        if data:
            print(f"Data: {json.dumps(data, indent=2)}")
        
        if response.status_code == expected_status:
            try:
                return True, response.json()
            except:
                return True, response.text
        else:
            try:
                error_data = response.json()
                return False, f"Status {response.status_code}: {error_data}"
            except:
                return False, f"Status {response.status_code}: {response.text}"
                
    except requests.exceptions.RequestException as e:
        return False, f"Request failed: {str(e)}"

def test_root_endpoint():
    """Test root API endpoint"""
    success, result = make_request('GET', '/')
    if success and isinstance(result, dict) and result.get('message') == 'Blog API Ready':
        log_test("Root API Endpoint", True, "API is ready")
        return True
    else:
        log_test("Root API Endpoint", False, f"Unexpected response: {result}")
        return False

def test_admin_login():
    """Test admin authentication with static credentials"""
    global admin_token
    
    # Test valid login
    login_data = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    success, result = make_request('POST', '/auth/login', login_data)
    
    if success and isinstance(result, dict) and result.get('success'):
        admin_token = result.get('token')
        user_data = result.get('user', {})
        
        if admin_token and user_data.get('email') == ADMIN_EMAIL and user_data.get('role') == 'admin':
            log_test("Admin Login - Valid Credentials", True, f"Token received, user: {user_data.get('name')}")
        else:
            log_test("Admin Login - Valid Credentials", False, "Missing token or user data")
            return False
    else:
        log_test("Admin Login - Valid Credentials", False, f"Login failed: {result}")
        return False
    
    # Test invalid login
    invalid_data = {
        "email": "wrong@email.com",
        "password": "wrongpass"
    }
    
    success, result = make_request('POST', '/auth/login', invalid_data, expected_status=401)
    
    if success and isinstance(result, dict) and 'error' in result:
        log_test("Admin Login - Invalid Credentials", True, "Correctly rejected invalid credentials")
    else:
        log_test("Admin Login - Invalid Credentials", False, f"Should have rejected: {result}")
        return False
    
    return True

def test_admin_me():
    """Test getting current admin with token"""
    if not admin_token:
        log_test("Admin /me Endpoint", False, "No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    success, result = make_request('GET', '/auth/me', headers=headers)
    
    if success and isinstance(result, dict) and result.get('email') == ADMIN_EMAIL:
        log_test("Admin /me Endpoint", True, f"Admin data retrieved: {result.get('name')}")
        return True
    else:
        log_test("Admin /me Endpoint", False, f"Failed to get admin data: {result}")
        return False

def test_newsletter_subscription():
    """Test newsletter subscription functionality"""
    test_email = f"test-{uuid.uuid4().hex[:8]}@example.com"
    
    # Test subscription
    subscribe_data = {"email": test_email}
    success, result = make_request('POST', '/subscribers', subscribe_data)
    
    if success and isinstance(result, dict) and result.get('success'):
        log_test("Newsletter Subscription", True, f"Subscribed {test_email}")
    else:
        log_test("Newsletter Subscription", False, f"Subscription failed: {result}")
        return False
    
    # Test duplicate subscription
    success, result = make_request('POST', '/subscribers', subscribe_data, expected_status=400)
    
    if success and isinstance(result, dict) and 'error' in result:
        log_test("Newsletter Duplicate Subscription", True, "Correctly rejected duplicate")
    else:
        log_test("Newsletter Duplicate Subscription", False, f"Should reject duplicate: {result}")
        return False
    
    # Test unsubscribe
    unsubscribe_data = {"email": test_email}
    success, result = make_request('POST', '/subscribers/unsubscribe', unsubscribe_data)
    
    if success and isinstance(result, dict) and result.get('success'):
        log_test("Newsletter Unsubscription", True, f"Unsubscribed {test_email}")
        return True
    else:
        log_test("Newsletter Unsubscription", False, f"Unsubscription failed: {result}")
        return False

def test_get_subscribers():
    """Test getting all subscribers (admin only)"""
    if not admin_token:
        log_test("Get Subscribers (Admin)", False, "No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    success, result = make_request('GET', '/subscribers', headers=headers)
    
    if success and isinstance(result, list):
        log_test("Get Subscribers (Admin)", True, f"Retrieved {len(result)} subscribers")
        return True
    else:
        log_test("Get Subscribers (Admin)", False, f"Failed to get subscribers: {result}")
        return False

def test_create_post():
    """Test creating a post (needed for comments and upvotes testing)"""
    global test_post_id, test_post_slug
    
    if not admin_token:
        log_test("Create Test Post", False, "No admin token available")
        return False
    
    post_data = {
        "title": f"Test Post {datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "content": "This is a test post for testing comments and upvotes functionality.",
        "excerpt": "Test post excerpt",
        "status": "published",
        "category": "Technology",
        "tags": ["test", "api"]
    }
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    success, result = make_request('POST', '/posts', post_data, headers=headers)
    
    if success and isinstance(result, dict) and result.get('id'):
        test_post_id = result.get('id')
        test_post_slug = result.get('slug')
        log_test("Create Test Post", True, f"Created post: {test_post_slug}")
        return True
    else:
        log_test("Create Test Post", False, f"Failed to create post: {result}")
        return False

def test_get_posts():
    """Test getting all posts"""
    success, result = make_request('GET', '/posts')
    
    if success and isinstance(result, dict) and 'posts' in result:
        posts = result.get('posts', [])
        log_test("Get Posts", True, f"Retrieved {len(posts)} posts")
        return True
    else:
        log_test("Get Posts", False, f"Failed to get posts: {result}")
        return False

def test_get_single_post():
    """Test getting a single post by slug"""
    if not test_post_slug:
        log_test("Get Single Post", False, "No test post slug available")
        return False
    
    success, result = make_request('GET', f'/posts/{test_post_slug}')
    
    if success and isinstance(result, dict) and result.get('slug') == test_post_slug:
        upvote_count = result.get('upvote_count', 0)
        log_test("Get Single Post", True, f"Retrieved post with {upvote_count} upvotes")
        return True
    else:
        log_test("Get Single Post", False, f"Failed to get post: {result}")
        return False

def test_submit_comment():
    """Test submitting a comment (goes to moderation)"""
    global test_comment_id
    
    if not test_post_slug:
        log_test("Submit Comment", False, "No test post available")
        return False
    
    comment_data = {
        "name": "Test User",
        "email": "testuser@example.com",
        "content": "This is a test comment for moderation testing."
    }
    
    success, result = make_request('POST', f'/posts/{test_post_slug}/comments', comment_data)
    
    if success and isinstance(result, dict) and result.get('success'):
        log_test("Submit Comment", True, "Comment submitted for moderation")
        return True
    else:
        log_test("Submit Comment", False, f"Failed to submit comment: {result}")
        return False

def test_get_public_comments():
    """Test getting approved comments (should be empty initially)"""
    if not test_post_slug:
        log_test("Get Public Comments", False, "No test post available")
        return False
    
    success, result = make_request('GET', f'/posts/{test_post_slug}/comments')
    
    if success and isinstance(result, list):
        log_test("Get Public Comments", True, f"Retrieved {len(result)} approved comments")
        return True
    else:
        log_test("Get Public Comments", False, f"Failed to get comments: {result}")
        return False

def test_get_pending_comments():
    """Test getting pending comments (admin only)"""
    global test_comment_id
    
    if not admin_token:
        log_test("Get Pending Comments", False, "No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    success, result = make_request('GET', '/admin/comments?status=pending', headers=headers)
    
    if success and isinstance(result, list):
        # Find our test comment
        for comment in result:
            if comment.get('content') == "This is a test comment for moderation testing.":
                test_comment_id = comment.get('id')
                break
        
        log_test("Get Pending Comments", True, f"Retrieved {len(result)} pending comments")
        return True
    else:
        log_test("Get Pending Comments", False, f"Failed to get pending comments: {result}")
        return False

def test_approve_comment():
    """Test approving a comment"""
    if not admin_token or not test_comment_id:
        log_test("Approve Comment", False, "No admin token or comment ID available")
        return False
    
    approve_data = {"status": "approved"}
    headers = {"Authorization": f"Bearer {admin_token}"}
    success, result = make_request('PUT', f'/admin/comments/{test_comment_id}', approve_data, headers=headers)
    
    if success and isinstance(result, dict) and result.get('success'):
        log_test("Approve Comment", True, "Comment approved successfully")
        return True
    else:
        log_test("Approve Comment", False, f"Failed to approve comment: {result}")
        return False

def test_get_approved_comments():
    """Test getting approved comments after approval"""
    if not test_post_slug:
        log_test("Get Approved Comments", False, "No test post available")
        return False
    
    success, result = make_request('GET', f'/posts/{test_post_slug}/comments')
    
    if success and isinstance(result, list) and len(result) > 0:
        log_test("Get Approved Comments", True, f"Retrieved {len(result)} approved comments")
        return True
    else:
        log_test("Get Approved Comments", False, f"No approved comments found: {result}")
        return False

def test_upvote_post():
    """Test upvoting a post"""
    if not test_post_id:
        log_test("Upvote Post", False, "No test post available")
        return False
    
    upvote_data = {"visitor_id": test_visitor_id}
    success, result = make_request('POST', f'/posts/{test_post_id}/upvote', upvote_data)
    
    if success and isinstance(result, dict) and result.get('upvoted') == True:
        count = result.get('count', 0)
        log_test("Upvote Post", True, f"Post upvoted, total count: {count}")
        return True
    else:
        log_test("Upvote Post", False, f"Failed to upvote: {result}")
        return False

def test_get_upvote_status():
    """Test getting upvote status"""
    if not test_post_id:
        log_test("Get Upvote Status", False, "No test post available")
        return False
    
    success, result = make_request('GET', f'/posts/{test_post_id}/upvote?visitor_id={test_visitor_id}')
    
    if success and isinstance(result, dict) and result.get('upvoted') == True:
        count = result.get('count', 0)
        log_test("Get Upvote Status", True, f"Upvote status confirmed, count: {count}")
        return True
    else:
        log_test("Get Upvote Status", False, f"Failed to get upvote status: {result}")
        return False

def test_toggle_upvote():
    """Test toggling upvote (should remove it)"""
    if not test_post_id:
        log_test("Toggle Upvote", False, "No test post available")
        return False
    
    upvote_data = {"visitor_id": test_visitor_id}
    success, result = make_request('POST', f'/posts/{test_post_id}/upvote', upvote_data)
    
    if success and isinstance(result, dict) and result.get('upvoted') == False:
        count = result.get('count', 0)
        log_test("Toggle Upvote", True, f"Upvote removed, total count: {count}")
        return True
    else:
        log_test("Toggle Upvote", False, f"Failed to toggle upvote: {result}")
        return False

def test_delete_comment():
    """Test deleting a comment (admin only)"""
    if not admin_token or not test_comment_id:
        log_test("Delete Comment", False, "No admin token or comment ID available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    success, result = make_request('DELETE', f'/admin/comments/{test_comment_id}', headers=headers)
    
    if success and isinstance(result, dict) and result.get('success'):
        log_test("Delete Comment", True, "Comment deleted successfully")
        return True
    else:
        log_test("Delete Comment", False, f"Failed to delete comment: {result}")
        return False

def run_all_tests():
    """Run all backend API tests"""
    print("=" * 60)
    print("BACKEND API TESTING - Enhanced Data Science Blog Platform")
    print("=" * 60)
    print()
    
    tests = [
        ("Root API Endpoint", test_root_endpoint),
        ("Admin Authentication", test_admin_login),
        ("Admin /me Endpoint", test_admin_me),
        ("Newsletter Subscription", test_newsletter_subscription),
        ("Get Subscribers (Admin)", test_get_subscribers),
        ("Create Test Post", test_create_post),
        ("Get Posts", test_get_posts),
        ("Get Single Post", test_get_single_post),
        ("Submit Comment", test_submit_comment),
        ("Get Public Comments (Empty)", test_get_public_comments),
        ("Get Pending Comments", test_get_pending_comments),
        ("Approve Comment", test_approve_comment),
        ("Get Approved Comments", test_get_approved_comments),
        ("Upvote Post", test_upvote_post),
        ("Get Upvote Status", test_get_upvote_status),
        ("Toggle Upvote", test_toggle_upvote),
        ("Delete Comment", test_delete_comment),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            log_test(test_name, False, f"Exception: {str(e)}")
            failed += 1
        
        time.sleep(0.5)  # Small delay between tests
    
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"✅ PASSED: {passed}")
    print(f"❌ FAILED: {failed}")
    print(f"📊 TOTAL:  {passed + failed}")
    print()
    
    if failed == 0:
        print("🎉 ALL TESTS PASSED! Backend APIs are working correctly.")
    else:
        print(f"⚠️  {failed} test(s) failed. Please check the details above.")
    
    return failed == 0

if __name__ == "__main__":
    run_all_tests()