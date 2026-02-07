#!/usr/bin/env python3
"""
Backend API Testing for Data Science Blog Platform
Tests all API endpoints including authentication, CRUD operations, and data validation.
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://nextposts.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

# Test credentials
ADMIN_EMAIL = "admin@blog.com"
ADMIN_PASSWORD = "admin123"
ADMIN_TOKEN = "admin123"

class BlogAPITester:
    def __init__(self):
        self.auth_token = None
        self.test_results = []
        self.failed_tests = []
        
    def log_test(self, test_name, success, message="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
        
        if not success:
            self.failed_tests.append(test_name)
    
    def test_root_endpoint(self):
        """Test root API endpoint"""
        try:
            response = requests.get(f"{API_BASE}/")
            if response.status_code == 200:
                data = response.json()
                if data.get('message') == "Blog API Ready":
                    self.log_test("Root endpoint", True, "API is ready")
                    return True
                else:
                    self.log_test("Root endpoint", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Root endpoint", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Root endpoint", False, f"Exception: {str(e)}")
            return False
    
    def test_auth_login(self):
        """Test authentication login"""
        try:
            payload = {
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            }
            response = requests.post(f"{API_BASE}/auth/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('token'):
                    self.auth_token = data['token']
                    self.log_test("Auth login", True, f"Token received: {self.auth_token}")
                    return True
                else:
                    self.log_test("Auth login", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Auth login", False, f"Status code: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Auth login", False, f"Exception: {str(e)}")
            return False
    
    def test_auth_invalid_credentials(self):
        """Test authentication with invalid credentials"""
        try:
            payload = {
                "email": "wrong@email.com",
                "password": "wrongpassword"
            }
            response = requests.post(f"{API_BASE}/auth/login", json=payload)
            
            if response.status_code == 401:
                data = response.json()
                if data.get('error') == "Invalid credentials":
                    self.log_test("Auth invalid credentials", True, "Correctly rejected invalid credentials")
                    return True
                else:
                    self.log_test("Auth invalid credentials", False, f"Unexpected error message: {data}")
                    return False
            else:
                self.log_test("Auth invalid credentials", False, f"Expected 401, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Auth invalid credentials", False, f"Exception: {str(e)}")
            return False
    
    def test_get_all_posts(self):
        """Test GET /api/posts - list all published posts"""
        try:
            response = requests.get(f"{API_BASE}/posts")
            
            if response.status_code == 200:
                data = response.json()
                if 'posts' in data and 'total' in data:
                    posts = data['posts']
                    total = data['total']
                    self.log_test("Get all posts", True, f"Retrieved {len(posts)} posts, total: {total}")
                    
                    # Verify posts have required fields
                    if posts:
                        post = posts[0]
                        required_fields = ['id', 'title', 'slug', 'content', 'category', 'tags', 'status']
                        missing_fields = [field for field in required_fields if field not in post]
                        if missing_fields:
                            self.log_test("Post fields validation", False, f"Missing fields: {missing_fields}")
                        else:
                            self.log_test("Post fields validation", True, "All required fields present")
                    
                    return True
                else:
                    self.log_test("Get all posts", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Get all posts", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get all posts", False, f"Exception: {str(e)}")
            return False
    
    def test_get_posts_with_filters(self):
        """Test GET /api/posts with category filter"""
        try:
            # Test with category filter
            response = requests.get(f"{API_BASE}/posts?category=Deep Learning")
            
            if response.status_code == 200:
                data = response.json()
                posts = data.get('posts', [])
                
                # Verify all posts have the correct category
                if posts:
                    correct_category = all(post.get('category') == 'Deep Learning' for post in posts)
                    if correct_category:
                        self.log_test("Posts category filter", True, f"Found {len(posts)} posts in 'Deep Learning' category")
                    else:
                        self.log_test("Posts category filter", False, "Some posts have incorrect category")
                else:
                    self.log_test("Posts category filter", True, "No posts found for category (valid result)")
                
                return True
            else:
                self.log_test("Posts category filter", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Posts category filter", False, f"Exception: {str(e)}")
            return False
    
    def test_get_posts_with_pagination(self):
        """Test GET /api/posts with limit and skip parameters"""
        try:
            response = requests.get(f"{API_BASE}/posts?limit=2&skip=0")
            
            if response.status_code == 200:
                data = response.json()
                posts = data.get('posts', [])
                limit = data.get('limit')
                skip = data.get('skip')
                
                if len(posts) <= 2 and limit == 2 and skip == 0:
                    self.log_test("Posts pagination", True, f"Pagination working: {len(posts)} posts returned")
                    return True
                else:
                    self.log_test("Posts pagination", False, f"Pagination issue: posts={len(posts)}, limit={limit}, skip={skip}")
                    return False
            else:
                self.log_test("Posts pagination", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Posts pagination", False, f"Exception: {str(e)}")
            return False
    
    def test_get_single_post(self):
        """Test GET /api/posts/[slug] - get specific post by slug"""
        try:
            slug = "introduction-to-neural-networks"
            response = requests.get(f"{API_BASE}/posts/{slug}")
            
            if response.status_code == 200:
                post = response.json()
                if post.get('slug') == slug:
                    self.log_test("Get single post", True, f"Retrieved post: {post.get('title')}")
                    
                    # Test view count increment by making another request
                    initial_views = post.get('view_count', 0)
                    response2 = requests.get(f"{API_BASE}/posts/{slug}")
                    if response2.status_code == 200:
                        post2 = response2.json()
                        new_views = post2.get('view_count', 0)
                        if new_views > initial_views:
                            self.log_test("View count increment", True, f"Views: {initial_views} → {new_views}")
                        else:
                            self.log_test("View count increment", False, f"Views didn't increment: {initial_views} → {new_views}")
                    
                    return True
                else:
                    self.log_test("Get single post", False, f"Wrong slug returned: {post.get('slug')}")
                    return False
            else:
                self.log_test("Get single post", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get single post", False, f"Exception: {str(e)}")
            return False
    
    def test_get_nonexistent_post(self):
        """Test GET /api/posts/[slug] with non-existent slug"""
        try:
            response = requests.get(f"{API_BASE}/posts/non-existent-post")
            
            if response.status_code == 404:
                data = response.json()
                if data.get('error') == "Post not found":
                    self.log_test("Get nonexistent post", True, "Correctly returned 404 for non-existent post")
                    return True
                else:
                    self.log_test("Get nonexistent post", False, f"Wrong error message: {data}")
                    return False
            else:
                self.log_test("Get nonexistent post", False, f"Expected 404, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get nonexistent post", False, f"Exception: {str(e)}")
            return False
    
    def test_create_post_without_auth(self):
        """Test POST /api/posts without authentication"""
        try:
            payload = {
                "title": "Test Post",
                "content": "Test content",
                "category": "Machine Learning",
                "tags": ["Test"],
                "status": "published"
            }
            response = requests.post(f"{API_BASE}/posts", json=payload)
            
            if response.status_code == 401:
                data = response.json()
                if data.get('error') == "Unauthorized":
                    self.log_test("Create post without auth", True, "Correctly rejected unauthorized request")
                    return True
                else:
                    self.log_test("Create post without auth", False, f"Wrong error message: {data}")
                    return False
            else:
                self.log_test("Create post without auth", False, f"Expected 401, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Create post without auth", False, f"Exception: {str(e)}")
            return False
    
    def test_create_post_with_auth(self):
        """Test POST /api/posts with authentication"""
        if not self.auth_token:
            self.log_test("Create post with auth", False, "No auth token available")
            return False
        
        try:
            payload = {
                "title": "Test Post from API",
                "content": "<p>This is a test post created via API</p>",
                "excerpt": "Test excerpt",
                "category": "Machine Learning",
                "tags": ["Test", "API"],
                "status": "published",
                "reading_time_minutes": 5
            }
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.post(f"{API_BASE}/posts", json=payload, headers=headers)
            
            if response.status_code == 200:
                post = response.json()
                if post.get('title') == payload['title']:
                    self.log_test("Create post with auth", True, f"Created post: {post.get('id')}")
                    # Store the post ID for later tests
                    self.test_post_id = post.get('id')
                    return True
                else:
                    self.log_test("Create post with auth", False, f"Post data mismatch: {post}")
                    return False
            else:
                self.log_test("Create post with auth", False, f"Status code: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create post with auth", False, f"Exception: {str(e)}")
            return False
    
    def test_update_post(self):
        """Test PUT /api/posts/[id] - update post"""
        if not hasattr(self, 'test_post_id') or not self.test_post_id:
            self.log_test("Update post", False, "No test post ID available")
            return False
        
        if not self.auth_token:
            self.log_test("Update post", False, "No auth token available")
            return False
        
        try:
            payload = {
                "title": "Updated Test Post from API",
                "content": "<p>This post has been updated via API</p>",
                "status": "published"
            }
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.put(f"{API_BASE}/posts/{self.test_post_id}", json=payload, headers=headers)
            
            if response.status_code == 200:
                post = response.json()
                if post.get('title') == payload['title']:
                    self.log_test("Update post", True, f"Updated post: {post.get('id')}")
                    return True
                else:
                    self.log_test("Update post", False, f"Post not updated correctly: {post}")
                    return False
            else:
                self.log_test("Update post", False, f"Status code: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Update post", False, f"Exception: {str(e)}")
            return False
    
    def test_delete_post(self):
        """Test DELETE /api/posts/[id] - delete post"""
        if not hasattr(self, 'test_post_id') or not self.test_post_id:
            self.log_test("Delete post", False, "No test post ID available")
            return False
        
        if not self.auth_token:
            self.log_test("Delete post", False, "No auth token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.delete(f"{API_BASE}/posts/{self.test_post_id}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("Delete post", True, f"Deleted post: {self.test_post_id}")
                    return True
                else:
                    self.log_test("Delete post", False, f"Delete not confirmed: {data}")
                    return False
            else:
                self.log_test("Delete post", False, f"Status code: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Delete post", False, f"Exception: {str(e)}")
            return False
    
    def test_get_categories(self):
        """Test GET /api/categories - list all categories"""
        try:
            response = requests.get(f"{API_BASE}/categories")
            
            if response.status_code == 200:
                categories = response.json()
                if isinstance(categories, list) and len(categories) > 0:
                    # Check if categories are sorted by sort_order
                    sort_orders = [cat.get('sort_order', 0) for cat in categories]
                    is_sorted = sort_orders == sorted(sort_orders)
                    
                    self.log_test("Get categories", True, f"Retrieved {len(categories)} categories")
                    if is_sorted:
                        self.log_test("Categories sorting", True, "Categories are sorted by sort_order")
                    else:
                        self.log_test("Categories sorting", False, f"Categories not sorted: {sort_orders}")
                    
                    return True
                else:
                    self.log_test("Get categories", False, f"Invalid categories response: {categories}")
                    return False
            else:
                self.log_test("Get categories", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get categories", False, f"Exception: {str(e)}")
            return False
    
    def test_create_category(self):
        """Test POST /api/categories - create new category"""
        if not self.auth_token:
            self.log_test("Create category", False, "No auth token available")
            return False
        
        try:
            payload = {
                "name": "Test Category",
                "description": "A test category created via API",
                "color": "#FF5733",
                "icon": "test",
                "sort_order": 99
            }
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.post(f"{API_BASE}/categories", json=payload, headers=headers)
            
            if response.status_code == 200:
                category = response.json()
                if category.get('name') == payload['name']:
                    self.log_test("Create category", True, f"Created category: {category.get('id')}")
                    return True
                else:
                    self.log_test("Create category", False, f"Category data mismatch: {category}")
                    return False
            else:
                self.log_test("Create category", False, f"Status code: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create category", False, f"Exception: {str(e)}")
            return False
    
    def test_get_tags(self):
        """Test GET /api/tags - list all tags"""
        try:
            response = requests.get(f"{API_BASE}/tags")
            
            if response.status_code == 200:
                tags = response.json()
                if isinstance(tags, list) and len(tags) > 0:
                    self.log_test("Get tags", True, f"Retrieved {len(tags)} tags")
                    
                    # Check if tags have required fields
                    if tags:
                        tag = tags[0]
                        required_fields = ['id', 'name', 'slug']
                        missing_fields = [field for field in required_fields if field not in tag]
                        if missing_fields:
                            self.log_test("Tag fields validation", False, f"Missing fields: {missing_fields}")
                        else:
                            self.log_test("Tag fields validation", True, "All required tag fields present")
                    
                    return True
                else:
                    self.log_test("Get tags", False, f"Invalid tags response: {tags}")
                    return False
            else:
                self.log_test("Get tags", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get tags", False, f"Exception: {str(e)}")
            return False
    
    def test_create_tag(self):
        """Test POST /api/tags - create new tag"""
        if not self.auth_token:
            self.log_test("Create tag", False, "No auth token available")
            return False
        
        try:
            payload = {
                "name": "Test Tag",
                "description": "A test tag created via API"
            }
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.post(f"{API_BASE}/tags", json=payload, headers=headers)
            
            if response.status_code == 200:
                tag = response.json()
                if tag.get('name') == payload['name']:
                    self.log_test("Create tag", True, f"Created tag: {tag.get('id')}")
                    return True
                else:
                    self.log_test("Create tag", False, f"Tag data mismatch: {tag}")
                    return False
            else:
                self.log_test("Create tag", False, f"Status code: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create tag", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 60)
        print("BACKEND API TESTING - Data Science Blog Platform")
        print("=" * 60)
        print(f"Testing API at: {API_BASE}")
        print()
        
        # Test sequence
        tests = [
            self.test_root_endpoint,
            self.test_auth_login,
            self.test_auth_invalid_credentials,
            self.test_get_all_posts,
            self.test_get_posts_with_filters,
            self.test_get_posts_with_pagination,
            self.test_get_single_post,
            self.test_get_nonexistent_post,
            self.test_create_post_without_auth,
            self.test_create_post_with_auth,
            self.test_update_post,
            self.test_delete_post,
            self.test_get_categories,
            self.test_create_category,
            self.test_get_tags,
            self.test_create_tag
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
            except Exception as e:
                print(f"❌ FAIL: {test.__name__} - Exception: {str(e)}")
                self.failed_tests.append(test.__name__)
        
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\nFailed Tests:")
            for test in self.failed_tests:
                print(f"  - {test}")
        
        print("\n" + "=" * 60)
        
        return passed == total

def main():
    """Main test execution"""
    tester = BlogAPITester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()