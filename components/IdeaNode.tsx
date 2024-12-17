import { Handle, Position } from "reactflow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowRight, Video } from "lucide-react";
import Image from "next/image";

interface IdeaNodeProps {
  data: {
    title: string;
    description: string;
    onExplore: (data: any) => void;
    onCreate: () => void;
    isFirstNode?: boolean;
  };
}

export default function IdeaNode({ data }: IdeaNodeProps) {
  return (
    <Card className="w-80 relative">
      <div className="absolute -top-4 -right-4 w-16 h-16 starsyo">
        <Image
          src="/STARS.gif"
          alt="New"
          width={48}
          height={48}
          className="w-full h-full object-contain"
        />
      </div>

      <CardHeader>
        <CardTitle className="text-lg">{data.title}</CardTitle>
        <CardDescription className="h-20 overflow-hidden">
          {data.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button onClick={() => data.onExplore(data)} className="w-full">
            Explore Further <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button onClick={data.onCreate} variant="outline" className="w-full">
            Create <Video className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </Card>
  );
}
