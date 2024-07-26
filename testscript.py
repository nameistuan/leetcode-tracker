import json

# Load the JSON data from a file
with open(r'C:\Users\Tuan Le\OneDrive\Desktop\code projects\leetcode-tracker\public\daily.json') as file:
    data = json.load(file)

problems_list = []

# Iterate over each object in the list and collect all problems
for entry in data:
    for problem in entry.get('problems', []):
        problems_list.append(problem)

# Sort the problems alphabetically
problems_list.sort()

# Print the sorted problems in a column format
for problem in problems_list:
    print(problem)

# Print the total count of problems
print("Total number of problems:", len(problems_list))
