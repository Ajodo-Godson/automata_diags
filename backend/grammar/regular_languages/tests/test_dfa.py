from grammar.regular_languages.dfa.dfa_mod import DFA

# Comment out example DFAs that aren't being used in tests
# dfa1 = DFA(Q={1, 2, 3}, Σ={"0", "1"}, δ={...}, q0=1, F={3})
#
# # Using plain English names
# dfa2 = DFA.create(
#     states={1, 2, 3},
#     alphabet={"0", "1"},
#     transitions={...},
#     start_state=1,
#     accept_states={3},
# )


def test_dfa_ending_in_one():
    """Test DFA that accepts strings ending in '1'"""
    dfa = DFA.from_table(
        transition_table={1: {"0": 1, "1": 2}, 2: {"0": 1, "1": 2}},
        start_state=1,
        accept_states={2},
    )

    # Test cases
    assert dfa.is_accept("1") == True
    assert dfa.is_accept("01") == True
    assert dfa.is_accept("11") == True
    assert dfa.is_accept("0") == False
    assert dfa.is_accept("10") == False
    assert dfa.is_accept("100") == False


def test_dfa_three_consecutive_zeros():
    """Test DFA that accepts strings with three consecutive 0s"""
    dfa = DFA.create(
        states={1, 2, 3, 4},
        alphabet={"0", "1"},
        transitions={
            1: {"0": 2, "1": 1},
            2: {"0": 3, "1": 1},
            3: {"0": 4, "1": 1},
            4: {"0": 4, "1": 1},
        },
        start_state=1,
        accept_states={4},
    )

    # Test cases
    assert dfa.is_accept("000") == True
    assert dfa.is_accept("0001") == True
    assert dfa.is_accept("1000") == True
    assert dfa.is_accept("0100") == False
    assert dfa.is_accept("0010") == False
    assert dfa.is_accept("11000") == False


if __name__ == "__main__":
    test_dfa_ending_in_one()
    test_dfa_three_consecutive_zeros()
