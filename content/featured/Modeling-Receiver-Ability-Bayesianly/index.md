---
date: '1'
title: 'Modeling Receiver Ability Bayesianly'
cover: './rfm.png'
external: https://joshuafayallen.github.io/blog/2025/passing-td-factor-model/
github: https://github.com/joshuafayallen/joshuafayallen.github.io/blob/main/blog/2025/passing-td-factor-model/polished-final-model.py
tech:
  - PyMC
  - Polars
  - ggplot
  - matplotlib
---

Isolating a player's skill from their surroundings is quite difficult since their are a variety potentially confounding team level variables. I built a Bayesian Hierarchical Factor model to estimate latent ability of every NFL pass catcher from 2002-present controlling for these team level factors and use Hilbert-Space Gaussian processes to capture in season time dynamics and career aging curves.
