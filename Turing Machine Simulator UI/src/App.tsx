import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { TuringMachineSimulator } from './components/simulators/TuringMachineSimulator';
import { DFANFASimulator } from './components/simulators/DFANFASimulator';
import { CFGSimulator } from './components/simulators/CFGSimulator';
import { PDASimulator } from './components/simulators/PDASimulator';
import { BookOpen } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dfa');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl">Automata Theory Simulator Suite</h1>
              <p className="text-sm text-muted-foreground">
                Interactive visualizations for DFA/NFA, CFG, PDA, and Turing Machines
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl">
              <TabsTrigger value="dfa">DFA/NFA</TabsTrigger>
              <TabsTrigger value="pda">PDA</TabsTrigger>
              <TabsTrigger value="cfg">CFG</TabsTrigger>
              <TabsTrigger value="tm">Turing Machine</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dfa" className="mt-0">
            <DFANFASimulator />
          </TabsContent>
          
          <TabsContent value="pda" className="mt-0">
            <PDASimulator />
          </TabsContent>
          
          <TabsContent value="cfg" className="mt-0">
            <CFGSimulator />
          </TabsContent>
          
          <TabsContent value="tm" className="mt-0">
            <TuringMachineSimulator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
