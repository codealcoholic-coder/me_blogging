const { MongoClient } = require('mongodb')
const { v4: uuidv4 } = require('uuid')

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017'
const DB_NAME = process.env.DB_NAME || 'blog_db'

async function seedData() {
  const client = new MongoClient(MONGO_URL)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db(DB_NAME)
    
    // Clear existing data
    await db.collection('categories').deleteMany({})
    await db.collection('posts').deleteMany({})
    await db.collection('tags').deleteMany({})
    
    console.log('Cleared existing data')
    
    // Seed Categories
    const categories = [
      {
        id: uuidv4(),
        name: 'Machine Learning',
        slug: 'machine-learning',
        description: 'ML algorithms, models, and techniques',
        color: '#3B82F6',
        icon: 'brain',
        sort_order: 1,
        created_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Data Science',
        slug: 'data-science',
        description: 'Data analysis, visualization, and insights',
        color: '#10B981',
        icon: 'chart',
        sort_order: 2,
        created_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Deep Learning',
        slug: 'deep-learning',
        description: 'Neural networks and AI',
        color: '#8B5CF6',
        icon: 'network',
        sort_order: 3,
        created_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Python',
        slug: 'python',
        description: 'Python programming and libraries',
        color: '#F59E0B',
        icon: 'code',
        sort_order: 4,
        created_at: new Date()
      }
    ]
    
    await db.collection('categories').insertMany(categories)
    console.log('✓ Seeded categories')
    
    // Seed Tags
    const tags = [
      { id: uuidv4(), name: 'Python', slug: 'python', created_at: new Date() },
      { id: uuidv4(), name: 'TensorFlow', slug: 'tensorflow', created_at: new Date() },
      { id: uuidv4(), name: 'PyTorch', slug: 'pytorch', created_at: new Date() },
      { id: uuidv4(), name: 'Tutorial', slug: 'tutorial', created_at: new Date() },
      { id: uuidv4(), name: 'Beginner', slug: 'beginner', created_at: new Date() },
    ]
    
    await db.collection('tags').insertMany(tags)
    console.log('✓ Seeded tags')
    
    // Seed Sample Posts
    const posts = [
      {
        id: uuidv4(),
        title: 'Introduction to Neural Networks',
        slug: 'introduction-to-neural-networks',
        excerpt: 'Learn the fundamentals of neural networks and how they work. Perfect for beginners starting their deep learning journey.',
        content: `
          <h2>What are Neural Networks?</h2>
          <p>Neural networks are computing systems inspired by biological neural networks in animal brains. They consist of interconnected nodes (neurons) that process information.</p>
          
          <h3>Key Components</h3>
          <ul>
            <li><strong>Input Layer:</strong> Receives the initial data</li>
            <li><strong>Hidden Layers:</strong> Process the data through weighted connections</li>
            <li><strong>Output Layer:</strong> Produces the final result</li>
          </ul>
          
          <h3>Example Code</h3>
          <pre><code class="language-python">
import tensorflow as tf
from tensorflow import keras

# Create a simple neural network
model = keras.Sequential([
    keras.layers.Dense(64, activation='relu', input_shape=(10,)),
    keras.layers.Dense(32, activation='relu'),
    keras.layers.Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
          </code></pre>
          
          <h3>Activation Functions</h3>
          <p>Activation functions introduce non-linearity into the network, allowing it to learn complex patterns:</p>
          <ul>
            <li><strong>ReLU:</strong> Most commonly used, returns max(0, x)</li>
            <li><strong>Sigmoid:</strong> Outputs values between 0 and 1</li>
            <li><strong>Tanh:</strong> Outputs values between -1 and 1</li>
          </ul>
          
          <h3>Training Process</h3>
          <p>Neural networks learn through a process called backpropagation:</p>
          <ol>
            <li>Forward pass: Input flows through the network</li>
            <li>Loss calculation: Compare output with expected result</li>
            <li>Backward pass: Adjust weights to minimize loss</li>
            <li>Repeat until convergence</li>
          </ol>
          
          <p>Stay tuned for more advanced topics in our upcoming posts!</p>
        `,
        featured_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
        category: 'Deep Learning',
        tags: ['Tutorial', 'Beginner', 'TensorFlow'],
        status: 'published',
        published_at: new Date(),
        view_count: 0,
        reading_time_minutes: 8,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        title: 'Data Visualization with Python',
        slug: 'data-visualization-with-python',
        excerpt: 'Master the art of creating stunning visualizations using Matplotlib, Seaborn, and Plotly.',
        content: `
          <h2>Why Data Visualization Matters</h2>
          <p>Data visualization is crucial for understanding patterns, trends, and insights in your data. A good visualization can communicate complex information quickly and effectively.</p>
          
          <h3>Popular Python Libraries</h3>
          <ul>
            <li><strong>Matplotlib:</strong> The foundational plotting library</li>
            <li><strong>Seaborn:</strong> Statistical data visualization built on Matplotlib</li>
            <li><strong>Plotly:</strong> Interactive visualizations</li>
          </ul>
          
          <h3>Basic Matplotlib Example</h3>
          <pre><code class="language-python">
import matplotlib.pyplot as plt
import numpy as np

# Sample data
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Create plot
plt.figure(figsize=(10, 6))
plt.plot(x, y, label='sin(x)', linewidth=2)
plt.xlabel('X axis')
plt.ylabel('Y axis')
plt.title('Sine Wave')
plt.legend()
plt.grid(True)
plt.show()
          </code></pre>
          
          <h3>Seaborn for Statistical Plots</h3>
          <pre><code class="language-python">
import seaborn as sns
import pandas as pd

# Load sample dataset
df = sns.load_dataset('iris')

# Create pairplot
sns.pairplot(df, hue='species')
plt.show()
          </code></pre>
          
          <h3>Best Practices</h3>
          <ol>
            <li>Choose the right chart type for your data</li>
            <li>Use appropriate color schemes</li>
            <li>Label axes clearly</li>
            <li>Avoid chart junk</li>
            <li>Consider your audience</li>
          </ol>
          
          <p>Happy visualizing!</p>
        `,
        featured_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
        category: 'Data Science',
        tags: ['Python', 'Tutorial'],
        status: 'published',
        published_at: new Date(Date.now() - 86400000), // 1 day ago
        view_count: 0,
        reading_time_minutes: 6,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        title: 'Getting Started with PyTorch',
        slug: 'getting-started-with-pytorch',
        excerpt: 'A comprehensive guide to PyTorch, one of the most popular deep learning frameworks.',
        content: `
          <h2>What is PyTorch?</h2>
          <p>PyTorch is an open-source machine learning library developed by Facebook's AI Research lab. It's known for its flexibility and ease of use, making it a favorite among researchers and developers.</p>
          
          <h3>Installation</h3>
          <pre><code class="language-bash">
pip install torch torchvision torchaudio
          </code></pre>
          
          <h3>Tensors in PyTorch</h3>
          <p>Tensors are the fundamental building blocks in PyTorch, similar to NumPy arrays but with GPU acceleration capabilities.</p>
          
          <pre><code class="language-python">
import torch

# Create tensors
x = torch.tensor([1, 2, 3])
y = torch.tensor([4, 5, 6])

# Basic operations
z = x + y
print(z)  # Output: tensor([5, 7, 9])

# Matrix multiplication
a = torch.randn(3, 4)
b = torch.randn(4, 5)
c = torch.matmul(a, b)
print(c.shape)  # Output: torch.Size([3, 5])
          </code></pre>
          
          <h3>Building a Simple Neural Network</h3>
          <pre><code class="language-python">
import torch.nn as nn

class SimpleNN(nn.Module):
    def __init__(self):
        super(SimpleNN, self).__init__()
        self.fc1 = nn.Linear(784, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 10)
        self.relu = nn.ReLU()
    
    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        x = self.fc3(x)
        return x

model = SimpleNN()
print(model)
          </code></pre>
          
          <h3>Key Features</h3>
          <ul>
            <li><strong>Dynamic Computation Graphs:</strong> Build and modify networks on the fly</li>
            <li><strong>Pythonic:</strong> Feels natural to Python developers</li>
            <li><strong>Strong GPU Support:</strong> Easy device management</li>
            <li><strong>Rich Ecosystem:</strong> Many libraries built on top of PyTorch</li>
          </ul>
          
          <p>In the next post, we'll dive deeper into training models with PyTorch!</p>
        `,
        featured_image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
        category: 'Machine Learning',
        tags: ['PyTorch', 'Tutorial', 'Beginner'],
        status: 'published',
        published_at: new Date(Date.now() - 172800000), // 2 days ago
        view_count: 0,
        reading_time_minutes: 10,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]
    
    await db.collection('posts').insertMany(posts)
    console.log('✓ Seeded sample posts')
    
    console.log('\\n✅ Database seeded successfully!')
    console.log(`   - ${categories.length} categories`)
    console.log(`   - ${tags.length} tags`)
    console.log(`   - ${posts.length} posts`)
    
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await client.close()
  }
}

seedData()
