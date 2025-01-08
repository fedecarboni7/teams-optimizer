# team_optimizer.pyx
import numpy as np
cimport numpy as np
from itertools import combinations
from libc.math cimport abs as c_abs

def calculate_team_score(indices, double[:, :] scores):
    cdef int i, j
    cdef int n_scores = scores.shape[1]
    cdef double[:] team_score = np.zeros(n_scores, dtype=np.float64)
    
    for i in indices:
        for j in range(n_scores):
            team_score[j] += scores[i, j]
    
    return np.asarray(team_score)

cdef double calculate_difference(double[:] team1_score, double[:] team2_score):
    cdef int i
    cdef double diff = 0
    cdef int n = team1_score.shape[0]
    
    for i in range(n):
        diff += c_abs(team1_score[i] - team2_score[i])
    
    return diff

def find_best_combination(double[:, :] scores):
    cdef int n_players = scores.shape[0]
    cdef int team_size = 2 if n_players // 2 == 1 else n_players // 2
    cdef double min_difference = float('inf')
    cdef double min_difference_total = float('inf')
    cdef double difference, difference_total
    
    all_combinations = list(combinations(range(n_players), team_size))
    mejores_equipos = []
    cdef int number_of_combinations = len(all_combinations) // 2
    
    if len(all_combinations) % 2 == 1:
        number_of_combinations += 1
    
    for i in range(number_of_combinations):
        team1_indices = all_combinations[i]
        team2_indices = tuple(i for i in range(n_players) if i not in team1_indices)
        
        team1_score = calculate_team_score(team1_indices, scores)
        team2_score = calculate_team_score(team2_indices, scores)
        
        difference = calculate_difference(team1_score, team2_score)
        difference_total = c_abs(sum(team1_score) - sum(team2_score))
        
        if difference < min_difference:
            min_difference = difference
            if difference_total < min_difference_total:
                min_difference_total = difference_total
                mejores_equipos = [(team1_indices, team2_indices)]
        elif difference == min_difference:
            if difference_total == min_difference_total:
                mejores_equipos.append((team1_indices, team2_indices))
    
    if len(mejores_equipos) > 1 and n_players > 3:
        mejores_equipos = mejores_equipos[:int(len(mejores_equipos) / 2)]
    
    return (mejores_equipos, min_difference_total)