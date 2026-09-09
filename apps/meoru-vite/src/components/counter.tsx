import * as React from 'react';

import { Badge } from '@meoru/ui/components/badge';
import { Button } from '@meoru/ui/components/button';
import { Card, CardContent } from '@meoru/ui/components/card';

export function Counter() {
  const [count, setCount] = React.useState(0);

  return (
    <Card className="w-75">
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Badge variant="default" className="px-4 py-2 text-2xl">
            Count: {count}
          </Badge>
        </div>
        <div className="flex justify-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => setCount(count - 1)} className="h-10 w-10">
            -
          </Button>
          <Button variant="default" size="icon" onClick={() => setCount(count + 1)} className="h-10 w-10">
            +
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
