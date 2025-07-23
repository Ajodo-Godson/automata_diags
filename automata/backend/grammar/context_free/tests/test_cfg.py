from automata.backend.grammar.context_free.cfg_mod import CFG


def test_cfg_anbn():
    nonterminals = {"S"}
    terminals = {"a", "b"}
    productions = {
        "S": [["a", "S", "b"], []],
    }
    cfg = CFG(
        nonterminals=nonterminals,
        terminals=terminals,
        productions=productions,
        start_symbol="S",
    )

    assert cfg.generates("ab")
    assert cfg.generates("aaabbb")
    assert not cfg.generates("aabbb")
