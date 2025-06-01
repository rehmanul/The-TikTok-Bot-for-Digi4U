# Update categories based on Digi4u's actual categories
DIGI4U_CATEGORIES = {
    "Electronics": [
        "Mobile Phones",
        "Laptops",
        "Gaming",
        "Audio",
        "Cameras"
    ],
    "Home & Garden": [
        "Kitchen Appliances",
        "Home Decor",
        "Garden Tools",
        "Furniture"
    ],
    "Fashion": [
        "Clothing",
        "Shoes",
        "Accessories",
        "Watches"
    ],
    "Health & Beauty": [
        "Skincare",
        "Makeup",
        "Health Supplements",
        "Fitness Equipment"
    ],
    "Sports & Outdoors": [
        "Fitness",
        "Outdoor Gear",
        "Sports Equipment"
    ],
    "Automotive": [
        "Car Accessories",
        "Tools",
        "Parts"
    ]
}

@app.route('/')
def index():
    """Redirect to dashboard"""
    return redirect(url_for('dashboard'))

@app.route('/api/categories')
def get_categories():
    """Get Digi4u categories"""
    return jsonify(DIGI4U_CATEGORIES)

@app.route('/dashboard')
def dashboard():
    """Dashboard page with analytics and overview"""
    try:
        # Get dashboard statistics
        stats = {
            'total_extractions': global_stats.processed,
            'successful_extractions': global_stats.success,
            'failed_extractions': global_stats.fail,
            'success_rate': round((global_stats.success / max(global_stats.processed, 1)) * 100, 1),
            'companies_found': global_stats.company_data['found'],
            'products_found': global_stats.product_data['found'],
            'emails_extracted': global_stats.company_data['emails'],
            'phones_extracted': global_stats.company_data['phones']
        }
        
        # Get recent extractions
        recent_extractions = data_repository.get_recent_companies(limit=10)
        
        # Get recent logs
        recent_logs = log_repository.get_recent_operations(limit=5)
        
        return render_template('dashboard.html', 
                             stats=stats,
                             recent_extractions=recent_extractions,
                             recent_logs=recent_logs)
                             
    except Exception as e:
        return render_template('dashboard.html', 
                             error=f"Error loading dashboard: {str(e)}")