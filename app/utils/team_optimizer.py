from itertools import combinations


def calculate_team_score(indices, scores):
    team_score = [0] * len(scores[0])
    for i in indices:
        for j in range(len(scores[0])):
            team_score[j] += scores[i][j]
    return team_score


def calculate_difference(team1_score, team2_score):
    return sum(abs(team1_score[i] - team2_score[i]) for i in range(len(team1_score)))


def find_best_combination(scores):
    all_combinations = list(combinations(range(len(scores)), 2 if len(scores) // 2 == 1 else len(scores) // 2))
    min_difference = float("inf")
    min_difference_total = float("inf")
    mejores_equipos = list()
    number_of_combinations = len(all_combinations) // 2
    if len(all_combinations) % 2 == 1:
        number_of_combinations += 1

    for i in range(number_of_combinations):
        team1_indices = all_combinations[i]
        team2_indices = [i for i in range(len(scores)) if i not in team1_indices]

        team1_score = calculate_team_score(team1_indices, scores)
        team2_score = calculate_team_score(team2_indices, scores)

        difference = calculate_difference(team1_score, team2_score)
        difference_total = abs(sum(team1_score) - sum(team2_score))

        if difference < min_difference:
            min_difference = difference
            if difference_total < min_difference_total:
                min_difference_total = difference_total
                mejores_equipos = [(team1_indices, team2_indices)]
        elif difference == min_difference:
            if difference_total == min_difference_total:
                mejores_equipos.append((team1_indices, team2_indices))

    if len(mejores_equipos) > 1 and len(scores) > 3:
        mejores_equipos = mejores_equipos[: int(len(mejores_equipos) / 2)]
    
    return (mejores_equipos, min_difference_total)
