import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score
import pickle

def train_models():
    dataset_path = os.path.join(os.path.dirname(__file__), 'dataset.csv')
    if not os.path.exists(dataset_path):
        print("Dataset not found. Please run seed.py first.")
        return

    print("Loading dataset...")
    df = pd.read_csv(dataset_path)
    
    # X features (all columns except 'disease')
    X = df.drop('disease', axis=1)
    y = df['disease']
    
    # Save the feature columns so the predictor knows the exact order
    feature_cols = list(X.columns)
    cols_path = os.path.join(os.path.dirname(__file__), 'columns.pkl')
    with open(cols_path, 'wb') as f:
        pickle.dump(feature_cols, f)
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest...")
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    rf_acc = accuracy_score(y_test, rf_model.predict(X_test))
    
    print("Training Naive Bayes...")
    nb_model = GaussianNB()
    nb_model.fit(X_train, y_train)
    nb_acc = accuracy_score(y_test, nb_model.predict(X_test))
    
    print("Training SVM...")
    svm_model = SVC(probability=True, random_state=42)
    svm_model.fit(X_train, y_train)
    svm_acc = accuracy_score(y_test, svm_model.predict(X_test))
    
    print(f"Random Forest Accuracy: {rf_acc:.4f}")
    print(f"Naive Bayes Accuracy: {nb_acc:.4f}")
    print(f"SVM Accuracy: {svm_acc:.4f}")
    
    # Select the best model (usually Random Forest)
    best_model = rf_model
    best_name = "RandomForest"
    
    # Save best model
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(best_model, f)
        
    print(f"Saved {best_name} as final model to model.pkl")

if __name__ == '__main__':
    train_models()
