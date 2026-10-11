import tempfile
import unittest
from pathlib import Path
import numpy as np
from examples.numpy_tutorials import (accuracy_calculator, dataprep, evaluate, logistic_regression,
                                      linear_regression, one_hot, one_hot_for, sigmoid)


class TutorialCorrections(unittest.TestCase):
    def test_f1_and_zero_denominators(self):
        self.assertEqual(accuracy_calculator([1, 0, 1, 0], [1, 0, 0, 1]), [.5, .5, .5, .5])
        self.assertEqual(accuracy_calculator([0, 0], [0, 0]), [1., 0., 0., 0.])

    def test_logistic_threshold_uses_probability(self):
        # A raw score of .2 is below .5, but sigmoid(.2) is above .5.
        predictions, loss = evaluate(np.array([.2, 0]), np.zeros((2, 1)), [[1], [1]])
        np.testing.assert_array_equal(predictions, [[1], [1]])
        self.assertTrue(np.isfinite(loss))

    def test_extreme_sigmoid_is_finite(self):
        np.testing.assert_allclose(sigmoid([-1000, 0, 1000]), [0, .5, 1])

    def test_split_ratios_and_training_only_scaling(self):
        values = np.arange(100.)
        raw = np.column_stack([values, np.ones(100), values % 2])
        seed = 4
        order = np.random.default_rng(seed).permutation(100)
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / 'raw.csv'; np.savetxt(file, raw, delimiter=',')
            a, b, c, ya, yb, yc = dataprep(file, [.6, .2, .2], seed)
        self.assertEqual([len(a), len(b), len(c)], [60, 20, 20])
        train_min, train_max = values[order[:60]].min(), values[order[:60]].max()
        np.testing.assert_allclose(b[:, 0], (values[order[60:80]] - train_min) / (train_max - train_min))
        np.testing.assert_array_equal(a[:, 1], np.zeros(60))

    def test_training_decreases_the_correct_objective(self):
        X = np.array([[-2], [-1], [1], [2]], dtype=float); Y = np.array([0, 0, 1, 1])
        for fit in (linear_regression, logistic_regression):
            _, accuracy, costs = fit(X, Y, learning_rate=.1, num_iters=200, rand_seed=0)
            self.assertEqual(accuracy, 1); self.assertLess(costs[-1], costs[0])

    def test_arbitrary_labels_and_reused_vocabulary(self):
        values = np.array([-10, 1000000000, -10, 42])
        vectorized, classes = one_hot(values); reference, _ = one_hot_for(values)
        self.assertEqual(vectorized.shape, (4, 3)); np.testing.assert_array_equal(vectorized, reference)
        subset, same = one_hot([42], classes=classes)
        self.assertEqual(subset.shape, (1, 3)); np.testing.assert_array_equal(classes, same)
        with self.assertRaises(ValueError): one_hot([7], classes=classes)

    def test_empty_encoding(self):
        encoded, classes = one_hot([]); self.assertEqual(encoded.shape, (0, 0)); self.assertEqual(classes.shape, (0, 1))


if __name__ == '__main__':
    unittest.main()
